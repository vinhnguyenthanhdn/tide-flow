// Approximate demonstration coefficients only. They are not calibrated to a
// named gauge or vertical datum and must not be used for navigation or safety.
// See docs/MODEL.md for the model boundary and contribution requirements.
export const TIDAL_CONSTITUENTS = {
  "bai-rang": {
    Z0: 0.0,
    M2: { A: 0.36, phi: 108.0 }, S2: { A: 0.13, phi: 142.0 },
    N2: { A: 0.07, phi:  84.0 }, K1: { A: 0.21, phi: 218.0 }, O1: { A: 0.16, phi: 193.0 },
  },
  "da-nang": {
    Z0: 0.0,
    M2: { A: 0.35, phi: 105.0 }, S2: { A: 0.12, phi: 140.0 },
    N2: { A: 0.07, phi:  80.0 }, K1: { A: 0.20, phi: 215.0 }, O1: { A: 0.15, phi: 190.0 },
  },
  "hoi-an": {
    Z0: 0.0,
    M2: { A: 0.34, phi: 106.0 }, S2: { A: 0.12, phi: 141.0 },
    N2: { A: 0.07, phi:  81.0 }, K1: { A: 0.20, phi: 216.0 }, O1: { A: 0.15, phi: 191.0 },
  },
  "nha-trang": {
    Z0: 0.0,
    M2: { A: 0.55, phi: 135.0 }, S2: { A: 0.22, phi: 172.0 },
    N2: { A: 0.11, phi: 110.0 }, K1: { A: 0.25, phi: 230.0 }, O1: { A: 0.18, phi: 205.0 },
  },
  "mui-ne": {
    Z0: 0.0,
    M2: { A: 0.78, phi: 155.0 }, S2: { A: 0.30, phi: 190.0 },
    N2: { A: 0.15, phi: 130.0 }, K1: { A: 0.32, phi: 240.0 }, O1: { A: 0.24, phi: 215.0 },
  },
  "vung-tau": {
    Z0: 0.0,
    M2: { A: 1.50, phi: 175.0 }, S2: { A: 0.55, phi: 210.0 },
    N2: { A: 0.28, phi: 150.0 }, K1: { A: 0.38, phi: 250.0 }, O1: { A: 0.28, phi: 225.0 },
  },
  "phu-quoc": {
    Z0: 0.0,
    M2: { A: 0.40, phi: 195.0 }, S2: { A: 0.22, phi: 235.0 },
    N2: { A: 0.08, phi: 170.0 }, K1: { A: 0.52, phi: 280.0 }, O1: { A: 0.42, phi: 255.0 },
  },
  "con-dao": {
    Z0: 0.0,
    M2: { A: 1.10, phi: 168.0 }, S2: { A: 0.42, phi: 205.0 },
    N2: { A: 0.20, phi: 143.0 }, K1: { A: 0.35, phi: 248.0 }, O1: { A: 0.26, phi: 223.0 },
  },
  "ha-long": {
    Z0: 0.0,
    M2: { A: 0.62, phi:  72.0 }, S2: { A: 0.18, phi: 110.0 },
    N2: { A: 0.12, phi:  47.0 }, K1: { A: 0.85, phi: 178.0 }, O1: { A: 0.72, phi: 155.0 },
  },
  "sam-son": {
    Z0: 0.0,
    M2: { A: 0.55, phi:  80.0 }, S2: { A: 0.16, phi: 118.0 },
    N2: { A: 0.11, phi:  55.0 }, K1: { A: 0.78, phi: 182.0 }, O1: { A: 0.65, phi: 158.0 },
  },
  "lang-co": {
    Z0: 0.0,
    M2: { A: 0.36, phi: 107.0 }, S2: { A: 0.13, phi: 142.0 },
    N2: { A: 0.07, phi:  82.0 }, K1: { A: 0.21, phi: 217.0 }, O1: { A: 0.16, phi: 192.0 },
  },
  "quy-nhon": {
    Z0: 0.0,
    M2: { A: 0.42, phi: 118.0 }, S2: { A: 0.16, phi: 155.0 },
    N2: { A: 0.08, phi:  93.0 }, K1: { A: 0.22, phi: 222.0 }, O1: { A: 0.17, phi: 197.0 },
  },
  "bay-of-fundy": {
    Z0: 0.0,
    M2: { A: 3.80, phi: 82.0 }, S2: { A: 1.20, phi: 118.0 },
    N2: { A: 0.75, phi: 58.0 }, K1: { A: 0.18, phi: 170.0 }, O1: { A: 0.14, phi: 146.0 },
  },
  "mont-saint-michel": {
    Z0: 0.0,
    M2: { A: 3.30, phi: 126.0 }, S2: { A: 1.05, phi: 163.0 },
    N2: { A: 0.62, phi: 101.0 }, K1: { A: 0.16, phi: 214.0 }, O1: { A: 0.12, phi: 190.0 },
  },
  "london-thames": {
    Z0: 0.0,
    M2: { A: 2.05, phi: 148.0 }, S2: { A: 0.72, phi: 184.0 },
    N2: { A: 0.38, phi: 123.0 }, K1: { A: 0.14, phi: 232.0 }, O1: { A: 0.11, phi: 207.0 },
  },
  "venice": {
    Z0: 0.0,
    M2: { A: 0.24, phi: 52.0 }, S2: { A: 0.12, phi: 89.0 },
    N2: { A: 0.05, phi: 28.0 }, K1: { A: 0.20, phi: 142.0 }, O1: { A: 0.16, phi: 118.0 },
  },
  "new-york-harbor": {
    Z0: 0.0,
    M2: { A: 0.72, phi: 194.0 }, S2: { A: 0.24, phi: 230.0 },
    N2: { A: 0.14, phi: 169.0 }, K1: { A: 0.12, phi: 278.0 }, O1: { A: 0.10, phi: 253.0 },
  },
  "san-francisco-bay": {
    Z0: 0.0,
    M2: { A: 0.58, phi: 226.0 }, S2: { A: 0.18, phi: 263.0 },
    N2: { A: 0.11, phi: 201.0 }, K1: { A: 0.36, phi: 310.0 }, O1: { A: 0.29, phi: 285.0 },
  },
  "rio-de-janeiro": {
    Z0: 0.0,
    M2: { A: 0.38, phi: 244.0 }, S2: { A: 0.17, phi: 281.0 },
    N2: { A: 0.08, phi: 219.0 }, K1: { A: 0.10, phi: 328.0 }, O1: { A: 0.08, phi: 303.0 },
  },
  "cape-town": {
    Z0: 0.0,
    M2: { A: 0.56, phi: 268.0 }, S2: { A: 0.20, phi: 305.0 },
    N2: { A: 0.11, phi: 243.0 }, K1: { A: 0.09, phi: 352.0 }, O1: { A: 0.07, phi: 327.0 },
  },
  "sydney-harbour": {
    Z0: 0.0,
    M2: { A: 0.64, phi: 292.0 }, S2: { A: 0.22, phi: 329.0 },
    N2: { A: 0.12, phi: 267.0 }, K1: { A: 0.13, phi: 16.0 }, O1: { A: 0.10, phi: 351.0 },
  },
  "tokyo-bay": {
    Z0: 0.0,
    M2: { A: 0.46, phi: 316.0 }, S2: { A: 0.19, phi: 353.0 },
    N2: { A: 0.09, phi: 291.0 }, K1: { A: 0.28, phi: 40.0 }, O1: { A: 0.22, phi: 15.0 },
  },
  "singapore-strait": {
    Z0: 0.0,
    M2: { A: 0.82, phi: 338.0 }, S2: { A: 0.35, phi: 15.0 },
    N2: { A: 0.16, phi: 313.0 }, K1: { A: 0.44, phi: 62.0 }, O1: { A: 0.34, phi: 37.0 },
  },
  "auckland": {
    Z0: 0.0,
    M2: { A: 0.92, phi: 24.0 }, S2: { A: 0.30, phi: 61.0 },
    N2: { A: 0.18, phi: 359.0 }, K1: { A: 0.18, phi: 108.0 }, O1: { A: 0.14, phi: 83.0 },
  },
}
