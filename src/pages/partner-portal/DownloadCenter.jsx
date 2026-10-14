import DocumentBrowser from '../../components/DocumentBrowser.jsx'
import { useLocale } from '../../context/LocaleContext.jsx'

export default function DownloadCenter() {
  const { ui } = useLocale()
  return (
    <DocumentBrowser
      category="download_center"
      eyebrow="Document center"
      title={ui.nav.documents}
      subtitle="Product brochures, technical specifications, and marketing materials for your projects."
      icon="download"
    />
  )
}
