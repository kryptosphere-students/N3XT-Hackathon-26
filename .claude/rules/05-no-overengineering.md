# Pas de surengineering

- Pas d'abstraction sans **3+ usages réels**.
- Pas de `try/catch` défensif "au cas où".
- Pas de feature flag pour un cas hypothétique.
- Pas de commentaire qui paraphrase le code.
- Validation aux **frontières du système uniquement** (input externe, API tierces).

Si une généralisation tente : demander "ai-je 3 usages concrets ?" Si non → coder le cas concret.

Source : [../../templates/memory-bootstrap/feedback_no_overengineering.md](../../templates/memory-bootstrap/feedback_no_overengineering.md).
