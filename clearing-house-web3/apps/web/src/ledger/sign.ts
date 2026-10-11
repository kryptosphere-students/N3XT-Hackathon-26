import { DeviceActionStatus, type DeviceActionState } from "@ledgerhq/device-management-kit";
import type { SignerEth } from "@ledgerhq/device-signer-kit-ethereum";
import { pad, serializeSignature, type Address, type Hex } from "viem";
import type { Observable } from "rxjs";

type DeviceAction<Output> = { observable: Observable<DeviceActionState<Output, unknown, unknown>> };

const V_OFFSET = 27;

// Waits for a device action. onPending fires when the Flex needs the user.
function runDeviceAction<Output>(action: DeviceAction<Output>, onPending?: () => void): Promise<Output> {
  return new Promise((resolve, reject) => {
    const sub = action.observable.subscribe({
      next: (state) => {
        if (state.status === DeviceActionStatus.Pending) onPending?.();
        if (state.status === DeviceActionStatus.Completed) {
          sub.unsubscribe();
          resolve(state.output);
        }
        if (state.status === DeviceActionStatus.Error) {
          sub.unsubscribe();
          reject(state.error);
        }
      },
      error: reject,
    });
  });
}

// Address of a derivation path, shown and confirmed on the Flex screen (checkOnDevice).
export async function readAddress(signer: SignerEth, path: string, onPending?: () => void): Promise<Address> {
  const output = await runDeviceAction(signer.getAddress(path, { checkOnDevice: true }), onPending);
  return output.address as Address;
}

// EIP-191 signature of a readable text (D6). The DMK gives r, s, v; viem wants one hex blob.
export async function signText(signer: SignerEth, path: string, text: string, onPending?: () => void): Promise<Hex> {
  const { r, s, v } = await runDeviceAction(signer.signMessage(path, text), onPending);
  return serializeSignature({
    r: pad(r),
    s: pad(s),
    v: BigInt(v >= V_OFFSET ? v : v + V_OFFSET),
  });
}
