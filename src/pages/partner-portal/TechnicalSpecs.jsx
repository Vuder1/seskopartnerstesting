import DocumentBrowser from '../../components/DocumentBrowser.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'

export default function TechnicalSpecs() {
  const { ui } = useLocale()
  return (
    <DocumentBrowser
      category="technical_specs"
      eyebrow="Technical center"
      title={ui.nav.specs}
      subtitle="Detailed system specifications, performance data and installation drawings."
      icon="download"
    />
  )
}
