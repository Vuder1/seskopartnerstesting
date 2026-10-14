import Honeypot from './Honeypot.jsx'
import Icon from './Icon.jsx'
import { useFormSubmit } from '../hooks/useFormSubmit.js'
import { useLocale } from '../context/LocaleContext.jsx'

const input = 'w-full rounded-[10px] border border-line bg-white px-4 py-2.5 text-[13px] focus:border-navy-2 focus:outline-none focus:ring-2 focus:ring-navy/10'
const label = 'mb-1.5 block text-[11px] font-bold text-muted'

export default function InquiryForm() {
  const { status, submit } = useFormSubmit()
  const { t } = useLocale()
  const f = t.portal.form

  return (
    <form onSubmit={submit} className="relative space-y-4">
      <Honeypot />
      <input type="hidden" name="_subject" value="New inquiry from an approved partner" />

      {status === 'sent' && (
        <div className="rounded-[10px] border border-ok/20 bg-ok-soft px-4 py-3 text-[13px] font-semibold text-ok">{f.sentMsg}</div>
      )}
      {status === 'error' && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] font-semibold text-red-700">{f.errorMsg}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="inquiry-name" className={label}>{f.labelName}</label>
          <input id="inquiry-name" name="name" type="text" required className={input} />
        </div>
        <div>
          <label htmlFor="inquiry-company" className={label}>{f.labelCompany}</label>
          <input id="inquiry-company" name="company" type="text" className={input} />
        </div>
        <div>
          <label htmlFor="inquiry-email" className={label}>{f.labelEmail}</label>
          <input id="inquiry-email" name="email" type="email" required className={input} />
        </div>
        <div>
          <label htmlFor="inquiry-type" className={label}>{f.labelType}</label>
          <select id="inquiry-type" name="inquiry_type" required defaultValue="" className={input}>
            <option value="" disabled>{f.typePlaceholder}</option>
            {t.portal.inquiryTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="inquiry-message" className={label}>{f.labelMessage}</label>
        <textarea id="inquiry-message" name="message" rows={4} required className={input} />
      </div>

      <button type="submit" disabled={status === 'sending'} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">
        {status === 'sending' ? f.btnSending : f.btnSubmit} <Icon name="arrow" className="h-4 w-4" />
      </button>
    </form>
  )
}
