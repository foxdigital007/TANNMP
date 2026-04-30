import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Inter font for PDF
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf', fontWeight: 800 },
  ],
});

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 340,
    height: 220,
    borderRadius: 12,
    border: '2px solid #E21B23',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#E21B23',
    padding: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 7,
    marginTop: 2,
    opacity: 0.8,
  },
  body: {
    padding: 16,
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  },
  photoContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoFallback: {
    fontSize: 24,
    fontWeight: 800,
    color: '#E21B23',
  },
  detailsContainer: {
    flex: 1,
  },
  label: {
    fontSize: 7,
    color: '#737373',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: 11,
    color: '#1A1A1A',
    fontWeight: 600,
    marginBottom: 8,
  },
  memberIdBadge: {
    backgroundColor: '#FEF2F2',
    padding: '4px 8px',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  memberIdText: {
    color: '#E21B23',
    fontSize: 12,
    fontWeight: 800,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1A1A1A',
    padding: 6,
    textAlign: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 6,
    opacity: 0.7,
  },
  watermark: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    opacity: 0.03,
    fontSize: 60,
    fontWeight: 800,
    color: '#E21B23',
    transform: 'rotate(-25deg)',
    pointerEvents: 'none',
  }
});

export const IDCardDocument = ({ member }) => {
  const initials = member?.firstName?.[0] || 'U';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.card}>
          {/* Watermark */}
          <Text style={styles.watermark}>TANNMP</Text>

          {/* Header */}
          <View style={styles.header}>
            <Image src={window.location.origin + "/assets/logo.png"} style={{ width: 30, height: 30, marginRight: 8 }} />
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>TANNMP</Text>
              <Text style={styles.subtitle}>TAMIL NADU NAIDU NMP PORTAL</Text>
            </View>
            <View style={{ backgroundColor: '#FFED00', padding: '2px 6px', borderRadius: 10 }}>
              <Text style={{ fontSize: 7, color: '#E21B23', fontWeight: 800 }}>OFFICIAL MEMBER</Text>
            </View>
          </View>

          {/* Decorative Flag */}
          <Image 
            src={window.location.origin + "/assets/flag.png"} 
            style={{ 
              position: 'absolute', 
              right: -20, 
              top: 50, 
              width: 150, 
              height: 100, 
              opacity: 0.15,
              zIndex: -1 
            }} 
          />

          {/* Body */}
          <View style={styles.body}>
            <View style={styles.photoContainer}>
              <Text style={styles.photoFallback}>{initials.toUpperCase()}</Text>
            </View>
            
            <View style={styles.detailsContainer}>
              <View>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{member?.firstName} {member?.lastName}</Text>
              </View>
              
              <View style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                <View>
                  <Text style={styles.label}>Community</Text>
                  <Text style={styles.value}>{member?.community || 'Naidu'}</Text>
                </View>
                <View>
                  <Text style={styles.label}>City</Text>
                  <Text style={styles.value}>{member?.city || 'Tamil Nadu'}</Text>
                </View>
              </View>

              <View style={styles.memberIdBadge}>
                <Text style={styles.label}>Membership ID</Text>
                <Text style={styles.memberIdText}>{member?.memberId}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>This is a digitally generated official membership card of TANNMP.</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};
