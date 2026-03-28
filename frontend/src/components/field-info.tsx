import type { AnyFieldApi } from '@tanstack/react-form'

export default function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="not-italic text-destructive text-sm font-medium mt-1 block">
          {field.state.meta.errors.map((err) => err.message).join(', ')}
        </em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}
