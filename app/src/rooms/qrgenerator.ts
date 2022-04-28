import * as qrcode from "qrcode"

export function generarQr(content: string) {
    return new Promise<string>((resolve, reject) => {
        qrcode.toDataURL(content, (err, url) => {
            if (err) reject(err)
            else resolve(url)
        })
    })
}