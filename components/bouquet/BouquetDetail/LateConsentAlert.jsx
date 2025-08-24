"use client";

import { Field, ErrorMessage } from "formik";

export default function LateConsentAlert({ city }) {
    return (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
            <label className="mt-2 flex items-start gap-2 text-sm text-amber-900">
                <Field
                    type="checkbox"
                    name="lateConsent"
                    className="mt-0.5 h-4 w-4 rounded border-amber-300"
                />
                <span>
          Comprendo que mi pedido <strong>podría no estar listo para mañana</strong> y deseo continuar.
        </span>
            </label>

            <ErrorMessage
                name="lateConsent"
                component="div"
                className="mt-1 text-xs text-red-600"
            />
        </div>
    );
}