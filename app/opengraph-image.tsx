import { ImageResponse } from 'next/og'

/**
 * Gambar preview saat link buatkanweb.id dibagikan di WhatsApp, Instagram,
 * Facebook, atau Twitter/X. Tanpa ini, share-an tampil polos tanpa gambar —
 * CTR-nya jauh lebih rendah.
 *
 * Digenerate saat build (route ini statis), jadi tidak menambah beban runtime.
 */

export const alt = 'BuatkanWeb.id — Jasa buat website UMKM otomatis dengan AI, siap dalam 5 menit'

export const size = { width: 1200, height: 630 }

export const contentType = 'image/png'

export default function OpenGraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    // Gradien senada palet landing page (#0D0D0D → #1E466B).
                    backgroundImage: 'linear-gradient(135deg, #0D0D0D 0%, #14283f 55%, #1E466B 100%)',
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                }}
            >
                {/* Aksen lingkaran biar tidak terlalu datar */}
                <div
                    style={{
                        position: 'absolute',
                        top: -160,
                        right: -120,
                        width: 520,
                        height: 520,
                        borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(103,186,244,0.32) 0%, rgba(103,186,244,0) 70%)',
                        display: 'flex',
                    }}
                />

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        fontSize: 26,
                        fontWeight: 700,
                        letterSpacing: 1,
                        color: '#67BAF4',
                        marginBottom: 34,
                    }}
                >
                    BUATKANWEB.ID
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 78,
                        fontWeight: 800,
                        lineHeight: 1.1,
                        letterSpacing: -2,
                        maxWidth: 900,
                    }}
                >
                    Buatkan Web Usahamu dalam 5 Menit
                </div>

                <div
                    style={{
                        display: 'flex',
                        fontSize: 32,
                        color: '#b6c6d6',
                        marginTop: 30,
                        maxWidth: 860,
                        lineHeight: 1.4,
                    }}
                >
                    Isi form, AI menyusun websitenya. Tanpa coding, tanpa prompt.
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 18,
                        marginTop: 48,
                        fontSize: 26,
                        color: '#0D0D0D',
                        background: '#67BAF4',
                        padding: '16px 34px',
                        borderRadius: 999,
                        fontWeight: 700,
                        // Satorai (mesin di balik ImageResponse) mengabaikan `width: fit-content`
                        // di dalam flex column — anak elemen tetap melar selebar induk.
                        // `alignSelf` yang benar-benar menahannya selebar isi.
                        alignSelf: 'flex-start',
                    }}
                >
                    Mulai gratis · Rp99.000 untuk online
                </div>
            </div>
        ),
        size,
    )
}
