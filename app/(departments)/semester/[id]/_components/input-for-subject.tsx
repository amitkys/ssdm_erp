import { Controller, UseFormReturn } from "react-hook-form"
import { NewSubjectType } from "../lib/zod-type/subject-type"
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"

export const InputForSubject = ({ form }: { form: UseFormReturn<NewSubjectType> }) => {

    return (
        <>
            <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel requiredLable>Name</FieldLabel>
                        <FieldContent>
                            <Input {...field} aria-invalid={fieldState.invalid} />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />


            <Controller
                control={form.control}
                name="code"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel requiredLable>Code</FieldLabel>
                        <FieldContent>
                            <Input {...field} aria-invalid={fieldState.invalid} />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />




            <Controller
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel requiredLable>Description</FieldLabel>
                        <FieldContent>
                            <Input {...field} aria-invalid={fieldState.invalid} />
                            <FieldError errors={[fieldState.error]} />
                        </FieldContent>
                    </Field>
                )}
            />

            <div className="flex w-full justify-between items-center">

                <Controller
                    control={form.control}
                    name="hasPractical"
                    render={({ field: { value, onChange, ...rest }, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Has Practiclal</FieldLabel>
                            <FieldContent>
                                <Switch checked={value} onCheckedChange={onChange} {...rest} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />



                <Controller
                    control={form.control}
                    name="practicalFee"
                    render={({ field, fieldState }) => (
                        <Field>
                            <FieldLabel requiredLable>Fee</FieldLabel>
                            <FieldContent>
                                <Input type="number" {...field} onChange={(e) => { const v = e.target.valueAsNumber; field.onChange(isNaN(v) ? undefined : v); }} aria-invalid={fieldState.invalid} />
                                <FieldError errors={[fieldState.error]} />
                            </FieldContent>
                        </Field>
                    )}
                />

            </div>

        </>
    )
}