// S-024 and S-041: NAV from the administrator's inputs, and the hash published
// in LotSettled (D8). The code guarantees the arithmetic and the trace, not the prices.
import { encodeAbiParameters, keccak256, parseUnits, type Hex } from "viem";
import { CASH_DECIMALS, ONE_SHARE, SHARE_DECIMALS, type NavInputs } from "./types.ts";

const HOLDING_QUANTITY_DECIMALS = 6;
const ONE_HOLDING_UNIT = 10n ** BigInt(HOLDING_QUANTITY_DECIMALS);
const DECIMAL_AMOUNT = /^\d+(\.\d{1,6})?$/;

// NAV inputs as written in a JSON fixture: amounts are decimal strings, readable by a human.
export type NavFixture = {
  fundName: string;
  navDate: string;
  source: string;
  holdings: { asset: string; quantity: string; price: string }[];
  liabilities: string;
  sharesOutstanding: string;
  // NAV published by the administrator, kept for comparison with computeNav
  navPerUnit?: string;
};

const NAV_HASH_ABI = [
  { type: "string" },
  { type: "string" },
  { type: "string" },
  {
    type: "tuple[]",
    components: [
      { name: "asset", type: "string" },
      { name: "quantity", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
  },
  { type: "uint256" },
  { type: "uint256" },
  { type: "uint256" },
] as const;

/**
 * Reads NAV inputs from a fixture, such as fixtures/nav-fund-f.json.
 * Throws, naming the field, if an amount is not a positive decimal number with at most 6 decimals.
 *
 * @example navInputsFromJson(fixture).liabilities // 100_000_000_000n for "100000"
 */
export function navInputsFromJson(json: NavFixture): NavInputs {
  return {
    fundName: json.fundName,
    navDate: json.navDate,
    source: json.source,
    holdings: json.holdings.map((holding, index) => ({
      asset: holding.asset,
      quantity: amount(`holdings[${index}].quantity`, holding.quantity, HOLDING_QUANTITY_DECIMALS),
      price: amount(`holdings[${index}].price`, holding.price, CASH_DECIMALS),
    })),
    liabilities: amount("liabilities", json.liabilities, CASH_DECIMALS),
    sharesOutstanding: amount("sharesOutstanding", json.sharesOutstanding, SHARE_DECIMALS),
  };
}

/**
 * NAV per share: (sum of quantity * price - liabilities) / sharesOutstanding.
 *
 * Contract: each holding value and the result are rounded down to the cash unit.
 * Throws if there are no shares, or if liabilities exceed the assets.
 *
 * @example computeNav(navInputsFromJson(fundF)) // 105_000_000n, that is 105.000000
 */
export function computeNav(inputs: NavInputs): bigint {
  if (inputs.sharesOutstanding <= 0n) throw new Error("NAV needs a positive number of shares outstanding");
  const assets = inputs.holdings.reduce((sum, h) => sum + (h.quantity * h.price) / ONE_HOLDING_UNIT, 0n);
  const netAssets = assets - inputs.liabilities;
  if (netAssets < 0n) throw new Error("NAV inputs have more liabilities than assets");
  return (netAssets * ONE_SHARE) / inputs.sharesOutstanding;
}

/**
 * Hash of the NAV inputs and of the NAV computed from them, passed to settle(lot)
 * and published in LotSettled. An auditor recomputes it from the same inputs.
 *
 * Contract: keccak256(abi.encode(fundName, navDate, source, holdings, liabilities,
 * sharesOutstanding, navPerUnit)), holdings as (string asset, uint256 quantity, uint256 price)[].
 * The order of the holdings matters.
 */
export function navHash(inputs: NavInputs): Hex {
  return keccak256(
    encodeAbiParameters(NAV_HASH_ABI, [
      inputs.fundName,
      inputs.navDate,
      inputs.source,
      inputs.holdings,
      inputs.liabilities,
      inputs.sharesOutstanding,
      computeNav(inputs),
    ]),
  );
}

function amount(field: string, value: string, decimals: number): bigint {
  if (!DECIMAL_AMOUNT.test(value)) throw new Error(`${field} must be a positive decimal number, got "${value}"`);
  return parseUnits(value, decimals);
}
