import Swal from 'sweetalert2'

const popupClass = {
  popup: 'sanketra-dialog',
  title: 'sanketra-dialog-title',
  htmlContainer: 'sanketra-dialog-text',
  actions: 'sanketra-dialog-actions',
  cancelButton: 'btn btn-secondary',
  input: 'textarea',
  validationMessage: 'sanketra-dialog-error',
}

export async function confirmAction(options: {
  title: string
  text: string
  confirmText: string
  tone?: 'primary' | 'danger'
}) {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    showCancelButton: true,
    focusCancel: true,
    reverseButtons: true,
    buttonsStyling: false,
    confirmButtonText: options.confirmText,
    cancelButtonText: 'Cancel',
    customClass: {
      ...popupClass,
      confirmButton: options.tone === 'danger' ? 'btn btn-danger-solid' : 'btn btn-primary',
    },
  })
  return result.isConfirmed
}

export async function promptReason(options: {
  title: string
  text: string
  confirmText: string
  defaultValue?: string
}) {
  const result = await Swal.fire({
    title: options.title,
    text: options.text,
    input: 'textarea',
    inputValue: options.defaultValue ?? '',
    inputPlaceholder: 'State the reason for this decision',
    inputAttributes: { 'aria-label': 'Reason' },
    showCancelButton: true,
    focusCancel: true,
    reverseButtons: true,
    buttonsStyling: false,
    confirmButtonText: options.confirmText,
    cancelButtonText: 'Cancel',
    customClass: {
      ...popupClass,
      confirmButton: 'btn btn-danger-solid',
    },
    preConfirm: (value) => {
      const reason = String(value ?? '').trim()
      if (reason.length < 8) {
        Swal.showValidationMessage('Enter a reason of at least 8 characters.')
        return false
      }
      return reason
    },
  })
  if (!result.isConfirmed || typeof result.value !== 'string') return null
  return result.value
}
