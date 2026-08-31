import os

path = 'web/src/components/pdf/FormalProposalPDF.tsx'
c = open(path, 'r', encoding='utf-8').read()

c = c.replace("'Inter'", "'Helvetica'")
c = c.replace("""Font.register({
    family: 'Helvetica',
    fonts: [
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff' }, // Regular
      { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff', fontWeight: 700 }, // Bold
    ]
  });""", "")

open(path, 'w', encoding='utf-8').write(c)
print('Replaced Inter with Helvetica in FormalProposalPDF.tsx')
