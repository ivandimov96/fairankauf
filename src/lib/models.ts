import { BRANDS } from "@/lib/options";

export type Brand = (typeof BRANDS)[number];

// Models per brand as sold in Germany (current and common used cars). The list
// drives the model picker in the form; anything missing goes through
// "Anderes Modell" (free text), so it does not have to be complete.
export const MODELS: Record<Brand, readonly string[]> = {
  Abarth: ["124 Spider", "500", "500e", "595", "600e", "695", "Grande Punto", "Punto Evo"],
  Aiways: ["U5", "U6"],
  Aixam: ["City", "Coupé", "Crossline", "Crossover", "e-City", "Minauto", "Roadline"],
  "Alfa Romeo": [
    "145", "146", "147", "155", "156", "159", "164", "166", "4C", "8C", "Brera", "Giulia", "Giulietta",
    "GT", "GTV", "Junior", "MiTo", "Spider", "Stelvio", "Tonale",
  ],
  Alpina: ["B3", "B4", "B5", "B6", "B7", "B8", "D3", "D4", "D5", "XB7", "XD3", "XD4"],
  Alpine: ["A110", "A290", "A390"],
  "Aston Martin": [
    "DB7", "DB9", "DB11", "DB12", "DBS", "DBX", "Rapide", "V8 Vantage", "V12 Vantage", "Vanquish", "Vantage",
  ],
  Audi: [
    "80", "100", "A1", "A2", "A3", "A4", "A4 allroad", "A5", "A6", "A6 allroad", "A7", "A8", "Cabriolet", "Coupé",
    "e-tron", "e-tron GT", "Q2", "Q3", "Q4 e-tron", "Q5", "Q6 e-tron", "Q7", "Q8", "Q8 e-tron", "R8",
    "RS3", "RS4", "RS5", "RS6", "RS7", "RS Q3", "RS Q8", "S1", "S3", "S4", "S5", "S6", "S7", "S8",
    "SQ5", "SQ7", "SQ8", "TT",
  ],
  Bentley: [
    "Arnage", "Azure", "Bentayga", "Brooklands", "Continental GT", "Continental GTC", "Continental Flying Spur",
    "Flying Spur", "Mulsanne",
  ],
  BMW: [
    "1er", "2er Coupé", "2er Cabrio", "2er Active Tourer", "2er Gran Tourer", "2er Gran Coupé", "3er", "4er",
    "5er", "6er", "7er", "8er", "i3", "i4", "i5", "i7", "i8", "iX", "iX1", "iX2", "iX3", "M2", "M3", "M4", "M5",
    "M6", "M8", "X1", "X2", "X3", "X3 M", "X4", "X4 M", "X5", "X5 M", "X6", "X6 M", "X7", "XM", "Z1", "Z3",
    "Z4", "Z8",
  ],
  BYD: ["Atto 2", "Atto 3", "Dolphin", "Dolphin Surf", "Han", "Seal", "Seal U", "Sealion 7", "Tang"],
  Cadillac: ["ATS", "BLS", "CT6", "CTS", "Escalade", "Lyriq", "SRX", "STS", "XT4", "XT5", "XT6"],
  Chevrolet: [
    "Aveo", "Camaro", "Captiva", "Corvette", "Cruze", "Epica", "Kalos", "Lacetti", "Malibu", "Matiz", "Nubira",
    "Orlando", "Silverado", "Spark", "Tahoe", "Trax", "Volt",
  ],
  Chrysler: ["300C", "300M", "Crossfire", "Grand Voyager", "PT Cruiser", "Sebring", "Voyager"],
  Citroën: [
    "Ami", "Berlingo", "C1", "C2", "C3", "C3 Aircross", "C3 Picasso", "C4", "C4 Aircross", "C4 Cactus",
    "C4 Picasso", "C4 SpaceTourer", "C4 X", "C5", "C5 Aircross", "C5 X", "C6", "C8", "C-Crosser", "C-Elysée",
    "C-Zero", "DS3", "DS4", "DS5", "ë-C4", "Jumper", "Jumpy", "Nemo", "Saxo", "SpaceTourer", "Xantia", "Xsara",
    "Xsara Picasso", "ZX",
  ],
  Corvette: ["C5", "C6", "C7", "C8", "Stingray", "Z06"],
  Cupra: ["Ateca", "Born", "Formentor", "Leon", "Leon Sportstourer", "Tavascan", "Terramar"],
  Dacia: [
    "Bigster", "Dokker", "Duster", "Jogger", "Lodgy", "Logan", "Logan MCV", "Sandero", "Sandero Stepway", "Spring",
  ],
  Daewoo: ["Espero", "Evanda", "Kalos", "Lacetti", "Lanos", "Leganza", "Matiz", "Nexia", "Nubira", "Rezzo", "Tacuma"],
  Daihatsu: ["Applause", "Charade", "Copen", "Cuore", "Materia", "Move", "Sirion", "Terios", "Trevis", "YRV"],
  Dodge: ["Avenger", "Caliber", "Challenger", "Charger", "Durango", "Journey", "Nitro", "RAM", "Viper"],
  "DS Automobiles": ["DS 3", "DS 3 Crossback", "DS 4", "DS 5", "DS 7", "DS 7 Crossback", "DS 9", "N°8"],
  Ferrari: [
    "296 GTB", "296 GTS", "360 Modena", "430 Scuderia", "458 Italia", "458 Spider", "488 GTB", "488 Spider",
    "512", "550 Maranello", "575M", "599 GTB", "612 Scaglietti", "812 Superfast", "California", "F8 Tributo",
    "F12berlinetta", "F355", "F430", "FF", "GTC4Lusso", "Portofino", "Purosangue", "Roma", "SF90", "Testarossa",
  ],
  Fiat: [
    "124 Spider", "500", "500C", "500e", "500L", "500X", "600", "600e", "Barchetta", "Brava", "Bravo", "Croma",
    "Doblò", "Ducato", "Fiorino", "Freemont", "Grande Panda", "Grande Punto", "Idea", "Linea", "Marea", "Multipla",
    "Panda", "Punto", "Punto Evo", "Qubo", "Scudo", "Sedici", "Seicento", "Stilo", "Talento", "Tipo", "Topolino",
    "Ulysse", "Uno",
  ],
  Ford: [
    "B-Max", "Bronco", "C-Max", "Capri", "Cougar", "EcoSport", "Edge", "Escort", "Explorer", "F-150", "Fiesta",
    "Focus", "Fusion", "Galaxy", "Grand C-Max", "Grand Tourneo Connect", "Ka", "Ka+", "Kuga", "Maverick",
    "Mondeo", "Mustang", "Mustang Mach-E", "Puma", "Ranger", "S-Max", "Scorpio", "Streetka", "Tourneo Connect",
    "Tourneo Courier", "Tourneo Custom", "Transit", "Transit Connect", "Transit Custom",
  ],
  Genesis: ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  GWM: ["Ora 03", "Ora 07", "Wey 03", "Wey 05"],
  Honda: [
    "Accord", "City", "Civic", "CR-V", "CR-Z", "CRX", "e", "e:Ny1", "FR-V", "HR-V", "Insight", "Integra", "Jazz",
    "Legend", "Logo", "NSX", "Prelude", "S2000", "Shuttle", "Stream", "ZR-V",
  ],
  Hongqi: ["E-HS9", "EH7", "EHS7"],
  Hummer: ["H1", "H2", "H3"],
  Hyundai: [
    "Accent", "Atos", "Bayon", "Coupé", "Elantra", "Galloper", "Genesis", "Getz", "Grand Santa Fe", "H-1", "i10",
    "i20", "i30", "i40", "Inster", "Ioniq", "Ioniq 5", "Ioniq 6", "Ioniq 9", "ix20", "ix35", "ix55", "Kona",
    "Matrix", "Nexo", "Santa Fe", "Sonata", "Staria", "Terracan", "Trajet", "Tucson", "Veloster",
  ],
  Ineos: ["Grenadier", "Grenadier Quartermaster"],
  Infiniti: ["EX", "FX", "G", "M", "Q30", "Q50", "Q60", "Q70", "QX30", "QX50", "QX70"],
  Isuzu: ["D-Max", "Trooper"],
  Iveco: ["Daily", "Eurocargo"],
  Jaguar: ["E-Pace", "E-Type", "F-Pace", "F-Type", "I-Pace", "S-Type", "X-Type", "XE", "XF", "XJ", "XK"],
  Jeep: ["Avenger", "Cherokee", "Commander", "Compass", "Gladiator", "Grand Cherokee", "Patriot", "Renegade", "Wrangler"],
  "KGM (SsangYong)": ["Actyon", "Korando", "Kyron", "Musso", "Rexton", "Rodius", "Tivoli", "Torres", "XLV"],
  Kia: [
    "Carens", "Carnival", "Ceed", "Cee'd", "Cerato", "EV3", "EV4", "EV5", "EV6", "EV9", "Magentis", "Niro",
    "Opirus", "Optima", "Picanto", "ProCeed", "Rio", "Sorento", "Soul", "Sportage", "Stinger", "Stonic", "Venga",
    "XCeed",
  ],
  Lada: ["4x4 (Niva)", "Granta", "Kalina", "Niva", "Priora", "Samara", "Vesta", "XRAY"],
  Lamborghini: ["Aventador", "Gallardo", "Huracán", "Murciélago", "Revuelto", "Temerario", "Urus"],
  Lancia: ["Delta", "Lybra", "Musa", "Phedra", "Thema", "Thesis", "Voyager", "Y", "Ypsilon"],
  "Land Rover": [
    "Defender", "Discovery", "Discovery Sport", "Freelander", "Range Rover", "Range Rover Evoque",
    "Range Rover Sport", "Range Rover Velar",
  ],
  Leapmotor: ["B10", "C10", "T03"],
  Lexus: ["CT", "ES", "GS", "IS", "LBX", "LC", "LS", "LX", "NX", "RC", "RX", "RZ", "SC", "UX"],
  Ligier: ["JS50", "JS60", "Myli", "Nova", "X-Too"],
  Lotus: ["Elise", "Eletre", "Emeya", "Emira", "Europa", "Evora", "Exige"],
  "Lynk & Co": ["01", "02", "08"],
  Maserati: [
    "3200 GT", "Coupé", "Ghibli", "GranCabrio", "GranTurismo", "Grecale", "Levante", "MC20", "Quattroporte", "Spyder",
  ],
  Maxus: ["Deliver 9", "eDeliver 3", "eDeliver 7", "eDeliver 9", "Mifa 9", "T90"],
  Maybach: ["57", "62", "GLS", "S-Klasse"],
  Mazda: [
    "2", "3", "5", "6", "323", "626", "BT-50", "CX-3", "CX-30", "CX-5", "CX-60", "CX-7", "CX-80", "Demio", "MX-3",
    "MX-30", "MX-5", "MX-6", "Premacy", "RX-7", "RX-8", "Tribute", "Xedos",
  ],
  McLaren: [
    "540C", "570GT", "570S", "600LT", "620R", "650S", "675LT", "720S", "750S", "765LT", "Artura", "GT", "MP4-12C",
    "P1", "Senna",
  ],
  "Mercedes-Benz": [
    "190", "A-Klasse", "AMG GT", "B-Klasse", "C-Klasse", "Citan", "CL", "CLA", "CLC", "CLE", "CLK", "CLS",
    "E-Klasse", "EQA", "EQB", "EQC", "EQE", "EQE SUV", "EQS", "EQS SUV", "EQT", "EQV", "G-Klasse", "GL", "GLA",
    "GLB", "GLC", "GLE", "GLK", "GLS", "M-Klasse (ML)", "R-Klasse", "S-Klasse", "SL", "SLC", "SLK", "SLS AMG",
    "Sprinter", "T-Klasse", "V-Klasse", "Vaneo", "Viano", "Vito", "W123", "W124", "X-Klasse",
  ],
  MG: ["Cyberster", "EHS", "HS", "Marvel R", "MG3", "MG4", "MG5", "MGF", "TF", "ZS"],
  Microcar: ["Dué", "Flex", "M.Go", "M8", "MC1", "MC2"],
  Mini: [
    "Aceman", "Cabrio", "Clubman", "Cooper", "Cooper Electric", "Cooper S", "Countryman", "Coupé",
    "John Cooper Works", "One", "Paceman", "Roadster",
  ],
  Mitsubishi: [
    "ASX", "Carisma", "Colt", "Eclipse", "Eclipse Cross", "Galant", "Grandis", "i-MiEV", "L200", "Lancer",
    "Lancer Evolution", "Outlander", "Pajero", "Pajero Pinin", "Space Star", "Space Wagon",
  ],
  NIO: ["EL6", "EL7", "EL8", "ET5", "ET5 Touring", "ET7"],
  Nissan: [
    "350Z", "370Z", "Almera", "Ariya", "Cube", "e-NV200", "GT-R", "Juke", "Leaf", "Maxima", "Micra", "Murano",
    "Navara", "Note", "NV200", "Pathfinder", "Patrol", "Pixo", "Primera", "Pulsar", "Qashqai", "Terrano", "Tiida",
    "Townstar", "X-Trail",
  ],
  Opel: [
    "Adam", "Agila", "Ampera", "Ampera-e", "Antara", "Ascona", "Astra", "Calibra", "Cascada", "Combo", "Corsa",
    "Crossland", "Frontera", "Grandland", "GT", "Insignia", "Kadett", "Karl", "Manta", "Meriva", "Mokka",
    "Monterey", "Movano", "Omega", "Signum", "Sintra", "Speedster", "Tigra", "Vectra", "Vivaro", "Zafira",
    "Zafira Life",
  ],
  Peugeot: [
    "106", "107", "108", "1007", "205", "206", "207", "208", "2008", "301", "306", "307", "308", "309", "3008",
    "405", "406", "407", "408", "4007", "4008", "508", "5008", "605", "607", "806", "807", "Bipper", "Boxer",
    "Expert", "iOn", "Partner", "RCZ", "Rifter", "Traveller",
  ],
  Polestar: ["1", "2", "3", "4"],
  Porsche: [
    "718 Boxster", "718 Cayman", "911", "924", "928", "944", "968", "Boxster", "Carrera GT", "Cayenne", "Cayman",
    "Macan", "Panamera", "Taycan",
  ],
  RAM: ["1500", "2500", "3500"],
  Renault: [
    "4", "5", "Alaskan", "Arkana", "Austral", "Avantime", "Captur", "Clio", "Espace", "Fluence", "Grand Scénic",
    "Kadjar", "Kangoo", "Koleos", "Laguna", "Latitude", "Master", "Mégane", "Mégane E-Tech", "Modus", "Rafale",
    "Scénic", "Symbioz", "Talisman", "Trafic", "Twingo", "Twizy", "Vel Satis", "Wind", "Zoe",
  ],
  "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Silver Seraph", "Silver Spirit", "Spectre", "Wraith"],
  Rover: ["25", "45", "75", "200", "400", "600", "800", "Streetwise"],
  Saab: ["9-3", "9-5", "9-7X", "900", "9000"],
  Seat: [
    "Alhambra", "Altea", "Altea XL", "Arona", "Arosa", "Ateca", "Cordoba", "Exeo", "Ibiza", "Leon",
    "Leon Sportstourer", "Mii", "Tarraco", "Toledo",
  ],
  Skoda: [
    "Citigo", "Elroq", "Enyaq", "Fabia", "Felicia", "Kamiq", "Karoq", "Kodiaq", "Octavia", "Rapid", "Roomster",
    "Scala", "Superb", "Yeti",
  ],
  Smart: ["#1", "#3", "#5", "Crossblade", "ForFour", "ForTwo", "Roadster"],
  Subaru: [
    "BRZ", "Crosstrek", "Forester", "Impreza", "Justy", "Legacy", "Levorg", "Outback", "Solterra", "Trezia",
    "Tribeca", "WRX STI", "XV",
  ],
  Suzuki: [
    "Across", "Alto", "Baleno", "Celerio", "Grand Vitara", "Ignis", "Jimny", "Kizashi", "Liana", "S-Cross",
    "Splash", "Swace", "Swift", "SX4", "Vitara", "Wagon R+",
  ],
  Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y", "Roadster"],
  Toyota: [
    "Auris", "Avensis", "Aygo", "Aygo X", "bZ4X", "C-HR", "Camry", "Carina", "Celica", "Corolla", "Corolla Cross",
    "Corolla Verso", "GR86", "GR Supra", "GR Yaris", "GT86", "Highlander", "Hilux", "iQ", "Land Cruiser", "Mirai",
    "MR2", "Previa", "Prius", "Prius+", "Proace", "Proace City", "RAV4", "Starlet", "Supra", "Urban Cruiser",
    "Verso", "Verso-S", "Yaris", "Yaris Cross",
  ],
  Trabant: ["601", "1.1", "P50", "P60"],
  VinFast: ["VF 6", "VF 7", "VF 8", "VF 9"],
  Volkswagen: [
    "Amarok", "Arteon", "Beetle", "Bora", "Caddy", "California", "CC", "Corrado", "Crafter", "Eos", "Fox", "Golf",
    "Golf Plus", "Golf Sportsvan", "Golf Variant", "ID.3", "ID.4", "ID.5", "ID.7", "ID. Buzz", "Jetta", "Käfer",
    "Lupo", "Multivan", "New Beetle", "Passat", "Passat CC", "Phaeton", "Polo", "Scirocco", "Sharan", "T-Cross",
    "T-Roc", "Taigo", "Tayron", "Tiguan", "Tiguan Allspace", "Touareg", "Touran", "Transporter (T4)",
    "Transporter (T5)", "Transporter (T6)", "Transporter (T7)", "up!", "Vento",
  ],
  Volvo: [
    "240", "740", "850", "940", "960", "C30", "C40", "C70", "EC40", "EX30", "EX40", "EX90", "S40", "S60", "S70",
    "S80", "S90", "V40", "V50", "V60", "V70", "V90", "XC40", "XC60", "XC70", "XC90",
  ],
  Wartburg: ["311", "353", "1.3"],
  XPENG: ["G6", "G9", "P7"],
  Zeekr: ["001", "7X", "X"],
};

const collator = new Intl.Collator("de", { numeric: true, sensitivity: "base" });

/** The brand's models, A–Z; empty for an unlisted brand (then the model is typed in). */
export function modelsFor(brand: string): readonly string[] {
  const models = (MODELS as Record<string, readonly string[] | undefined>)[brand];
  return models ? [...models].sort(collator.compare) : [];
}
