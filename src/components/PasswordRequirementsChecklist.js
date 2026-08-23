import { Check, X } from "lucide-react";
import { PASSWORD_REQUIREMENTS } from "../utils/passwordRequirements";

// Live checklist shown while the user types a new password, so they can
// see which requirements are already satisfied before submitting.
export default function PasswordRequirementsChecklist({ password }) {
  const value = password || "";

  return (
    <ul className="mt-2 space-y-1">
      {PASSWORD_REQUIREMENTS.map((requirement) => {
        const met = requirement.test(value);
        return (
          <li
            key={requirement.id}
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              met ? "text-green-600" : "text-slate-400"
            }`}
          >
            {met ? <Check size={14} /> : <X size={14} />}
            {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}
