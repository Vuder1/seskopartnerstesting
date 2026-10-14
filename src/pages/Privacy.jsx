import { useLocale } from '../context/LocaleContext.jsx'

const COPY = {
  en: {
    eyebrow: 'Privacy',
    title: 'Privacy Policy',
    updated: 'Last updated: September 2026',
    sections: [
      {
        h: 'Who we are',
        p: 'The SESKO Partner Portal is operated by SESKO Sp. z o.o. (KRS 0000518760), a Polish manufacturer of aluminium and steel windows, doors and facades. For the purposes of data protection law, SESKO Sp. z o.o. is the controller of any personal data processed through this portal.',
      },
      {
        h: 'What we collect',
        p: 'To create a partner account we collect your name, email address, firm/company name and a password (stored as a one-way hash, never in plain text). Once approved, your account may be linked to project records, technical documents you download, and comments or messages you post on a project. If you use our public contact or inquiry forms, we collect the details you submit — name, email, company and message.',
      },
      {
        h: 'Why we use it',
        p: 'We use this data to operate your partner account, verify and approve firm access, track and share project status and documents, and respond to inquiries. This is necessary to perform our contract with you or your firm, or to take steps at your request before entering into one.',
      },
      {
        h: 'How we keep your session secure',
        p: 'When you log in, we issue a session cookie marked HttpOnly, Secure and SameSite — it cannot be read by JavaScript and is only sent over encrypted connections. We do not store your session token or password in browser local storage. Local storage is used only to remember your interface language preference.',
      },
      {
        h: 'How long we keep it',
        p: 'Account and project data is kept for as long as your firm has an active partnership with SESKO, plus any period required by Polish accounting, tax or warranty law afterwards. Inquiries that don’t lead to an active partnership are deleted after a reasonable period. You can request earlier deletion of your account as described under "Your rights" below.',
      },
      {
        h: 'Who we share it with',
        p: "We don't sell or share your data with advertisers. Data may be visible to authorised SESKO staff administering the portal, and is processed by service providers who host this platform, strictly on our instructions and bound by confidentiality obligations.",
      },
      {
        h: 'Your rights',
        p: 'Under the GDPR, you can ask us to access, correct, delete or restrict the personal data we hold about you, object to our use of it, or request a copy in a portable format. To exercise any of these rights, or to close your account, contact us at info@sesko.pl. You can also lodge a complaint with Poland’s data protection authority, the Urząd Ochrony Danych Osobowych (UODO).',
      },
      {
        h: 'Security',
        p: 'This portal is served over HTTPS, passwords are hashed, access to project data is restricted by account permissions, and we apply rate limiting and input validation across the platform to protect your data from abuse.',
      },
      {
        h: 'Changes to this policy',
        p: 'We may update this policy from time to time. Material changes will be reflected by an updated date at the top of this page.',
      },
      {
        h: 'Contact',
        p: 'Questions about this policy or your data can be sent to info@sesko.pl.',
      },
    ],
  },
  pl: {
    eyebrow: 'Prywatność',
    title: 'Polityka prywatności',
    updated: 'Ostatnia aktualizacja: wrzesień 2026',
    sections: [
      {
        h: 'Kim jesteśmy',
        p: 'Portal Partnerski SESKO prowadzony jest przez SESKO Sp. z o.o. (KRS 0000518760), polskiego producenta okien, drzwi i fasad aluminiowych oraz stalowych. W rozumieniu przepisów o ochronie danych osobowych SESKO Sp. z o.o. jest administratorem danych osobowych przetwarzanych w portalu.',
      },
      {
        h: 'Jakie dane zbieramy',
        p: 'Zakładając konto partnera zbieramy imię i nazwisko, adres e-mail, nazwę firmy oraz hasło (przechowywane wyłącznie w postaci jednokierunkowego skrótu, nigdy jawnym tekstem). Po zatwierdzeniu konto może być powiązane z danymi projektów, dokumentami technicznymi oraz komentarzami dodawanymi przy projekcie. Korzystając z formularzy kontaktowych zbieramy przekazane dane: imię, e-mail, firmę i treść wiadomości.',
      },
      {
        h: 'W jakim celu je wykorzystujemy',
        p: 'Dane te służą do obsługi konta partnera, weryfikacji i zatwierdzania dostępu firm, śledzenia statusu projektów i udostępniania dokumentów oraz odpowiedzi na zapytania. Jest to niezbędne do wykonania umowy z Państwem lub Państwa firmą albo do podjęcia działań przed jej zawarciem.',
      },
      {
        h: 'Jak zabezpieczamy sesję',
        p: 'Po zalogowaniu wystawiamy plik cookie sesyjny oznaczony jako HttpOnly, Secure i SameSite — nie jest on odczytywalny przez JavaScript i przesyłany wyłącznie przez szyfrowane połączenie. Nie przechowujemy tokenu sesji ani hasła w pamięci lokalnej przeglądarki — local storage służy jedynie do zapamiętania wybranego języka interfejsu.',
      },
      {
        h: 'Jak długo przechowujemy dane',
        p: 'Dane konta i projektów przechowujemy przez czas trwania aktywnej współpracy Państwa firmy z SESKO, a następnie przez okres wymagany przepisami o rachunkowości, podatkami lub gwarancją. Zapytania niekończące się nawiązaniem współpracy są usuwane po rozsądnym okresie. Mogą Państwo zażądać wcześniejszego usunięcia konta — patrz „Państwa prawa” poniżej.',
      },
      {
        h: 'Komu udostępniamy dane',
        p: 'Nie sprzedajemy ani nie udostępniamy Państwa danych reklamodawcom. Dane mogą być widoczne dla upoważnionych pracowników SESKO administrujących portalem oraz przetwarzane przez dostawców usług hostingowych, wyłącznie na nasze polecenie i z zachowaniem poufności.',
      },
      {
        h: 'Państwa prawa',
        p: 'Zgodnie z RODO mają Państwo prawo do dostępu, sprostowania, usunięcia lub ograniczenia przetwarzania swoich danych, wniesienia sprzeciwu wobec ich przetwarzania oraz otrzymania ich w ustrukturyzowanym formacie. Aby skorzystać z tych praw lub zamknąć konto, prosimy o kontakt: info@sesko.pl. Przysługuje Państwu również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).',
      },
      {
        h: 'Bezpieczeństwo',
        p: 'Portal działa w oparciu o szyfrowane połączenie HTTPS, hasła są przechowywane w postaci skrótu, dostęp do danych projektów ograniczony jest uprawnieniami konta, a cała platforma objęta jest limitowaniem liczby żądań oraz walidacją danych wejściowych.',
      },
      {
        h: 'Zmiany polityki',
        p: 'Niniejsza polityka może być okresowo aktualizowana. Istotne zmiany zostaną odzwierciedlone aktualną datą u góry tej strony.',
      },
      {
        h: 'Kontakt',
        p: 'Pytania dotyczące niniejszej polityki lub swoich danych prosimy kierować na adres info@sesko.pl.',
      },
    ],
  },
}

export default function Privacy() {
  const { locale } = useLocale()
  const c = COPY[locale] || COPY.en

  return (
    <div className="panel mx-auto max-w-2xl p-7 sm:p-10">
      <p className="eyebrow">{c.eyebrow}</p>
      <h1 className="page-title mt-2">{c.title}</h1>
      <p className="mt-3 text-[12px] text-muted-2">{c.updated}</p>

      <div className="mt-9 space-y-8 text-[13px] leading-relaxed text-muted">
        {c.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-[15px] font-extrabold tracking-[-0.02em] text-navy">{s.h}</h2>
            <p className="mt-3">{s.p}</p>
          </section>
        ))}
      </div>
    </div>
  )
}
