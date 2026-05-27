import { Controller, type UseFormReturn } from "react-hook-form"
import { type NewFeeType } from "../lib/zod-type/fee-type"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const InputForFee = ({ form }: { form: UseFormReturn<NewFeeType> }) => {

    return (
        <>
            <div className="intiUni flex justify-center items-center gap-5">
                <Controller
                    control={form.control}
                    name="institution"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Institution Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="university"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>University Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </div>

            <div className="latePract flex justify-center items-center gap-5">
                <Controller
                    control={form.control}
                    name="late"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Late Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="practical"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Practical Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />
            </div>

            <div className="others flex justify-center items-center gap-5">
                <Controller
                    control={form.control}
                    name="cultural"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Cultural Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="sports"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Sports Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

            </div>
            
            <Controller
                control={form.control}
                name="miscellaneous"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel requiredLable>Miscellaneous Fee</FieldLabel>
                        <FieldContent>
                            <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />
        </>
    )
}