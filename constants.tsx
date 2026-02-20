
import React from 'react';
import { LogoVariant } from './types';

export const LOGO_VARIANTS: LogoVariant[] = [
  { 
    id: 'purple', 
    name: 'ZPRIA Purple', 
    primary: '#7C3AED', 
    secondary: '#A855F7', 
    accent: '#D8B4FE', 
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)' 
  },
  { id: 'ocean', name: 'Ocean Blue', primary: '#0EA5E9', secondary: '#38BDF8', accent: '#BAE6FD', gradient: 'linear-gradient(135deg, #0EA5E9 0%, #38BDF8 100%)' },
  { id: 'coral', name: 'Coral Sun', primary: '#F43F5E', secondary: '#FB7185', accent: '#FECDD3', gradient: 'linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)' },
  { id: 'lime', name: 'Cyber Lime', primary: '#84CC16', secondary: '#A3E635', accent: '#D9F99D', gradient: 'linear-gradient(135deg, #84CC16 0%, #A3E635 100%)' },
  { id: 'forest', name: 'Deep Forest', primary: '#10B981', secondary: '#34D399', accent: '#A7F3D0', gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)' },
  { id: 'indigo', name: 'Electric Indigo', primary: '#6366F1', secondary: '#818CF8', accent: '#C7D2FE', gradient: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)' },
  { id: 'royal', name: 'Royal Gold', primary: '#EAB308', secondary: '#FACC15', accent: '#FEF08A', gradient: 'linear-gradient(135deg, #CA8A04 0%, #EAB308 100%)' },
  { id: 'sunset', name: 'Vibrant Sunset', primary: '#F97316', secondary: '#FB923C', accent: '#FFEDD5', gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)' },
  { id: 'nature', name: 'Pure Nature', primary: '#14B8A6', secondary: '#2DD4BF', accent: '#99F6E4', gradient: 'linear-gradient(135deg, #0D9488 0%, #14B8A6 100%)' },
  { id: 'dark', name: 'Onyx Dark', primary: '#1F2937', secondary: '#374151', accent: '#9CA3AF', gradient: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' }
];

export const DEFAULT_THEME = LOGO_VARIANTS[0];

export const COUNTRY_LIST = [
  { value: "AF", label: "Afghanistan", code: "+93" },
  { value: "AX", label: "Åland Islands", code: "+358" },
  { value: "AL", label: "Albania", code: "+355" },
  { value: "DZ", label: "Algeria", code: "+213" },
  { value: "AS", label: "American Samoa", code: "+1" },
  { value: "AD", label: "Andorra", code: "+376" },
  { value: "AO", label: "Angola", code: "+244" },
  { value: "AI", label: "Anguilla", code: "+1" },
  { value: "AQ", label: "Antarctica", code: "+672" },
  { value: "AG", label: "Antigua And Barbuda", code: "+1" },
  { value: "AR", label: "Argentina", code: "+54" },
  { value: "AM", label: "Armenia", code: "+374" },
  { value: "AW", label: "Aruba", code: "+297" },
  { value: "AU", label: "Australia", code: "+61" },
  { value: "AT", label: "Austria", code: "+43" },
  { value: "AZ", label: "Azerbaijan", code: "+994" },
  { value: "BS", label: "Bahamas", code: "+1" },
  { value: "BH", label: "Bahrain", code: "+973" },
  { value: "BD", label: "Bangladesh", code: "+880" },
  { value: "BB", label: "Barbados", code: "+1" },
  { value: "BY", label: "Belarus", code: "+375" },
  { value: "BE", label: "Belgium", code: "+32" },
  { value: "BZ", label: "Belize", code: "+501" },
  { value: "BJ", label: "Benin", code: "+229" },
  { value: "BM", label: "Bermuda", code: "+1" },
  { value: "BT", label: "Bhutan", code: "+975" },
  { value: "BO", label: "Bolivia", code: "+591" },
  { value: "BA", label: "Bosnia and Herzegovina", code: "+387" },
  { value: "BW", label: "Botswana", code: "+267" },
  { value: "BV", label: "Bouvet Island", code: "+47" },
  { value: "BR", label: "Brazil", code: "+55" },
  { value: "VG", label: "British Virgin Islands", code: "+1" },
  { value: "BN", label: "Brunei Darussalam", code: "+673" },
  { value: "BG", label: "Bulgaria", code: "+359" },
  { value: "BF", label: "Burkina Faso", code: "+226" },
  { value: "BI", label: "Burundi", code: "+257" },
  { value: "KH", label: "Cambodia", code: "+855" },
  { value: "CM", label: "Cameroon", code: "+237" },
  { value: "CA", label: "Canada", code: "+1" },
  { value: "CV", label: "Cape Verde", code: "+238" },
  { value: "BQ", label: "Caribbean Netherlands", code: "+599" },
  { value: "KY", label: "Cayman Islands", code: "+1" },
  { value: "CF", label: "Central African Republic", code: "+236" },
  { value: "TD", label: "Chad", code: "+235" },
  { value: "IO", label: "Chagos Archipelago", code: "+246" },
  { value: "CL", label: "Chile", code: "+56" },
  { value: "CN", label: "China mainland", code: "+86" },
  { value: "CX", label: "Christmas Island", code: "+61" },
  { value: "CC", label: "Cocos (Keeling) Islands", code: "+61" },
  { value: "CO", label: "Colombia", code: "+57" },
  { value: "KM", label: "Comoros", code: "+269" },
  { value: "CK", label: "Cook Islands", code: "+682" },
  { value: "CR", label: "Costa Rica", code: "+506" },
  { value: "CI", label: "Côte d'Ivoire", code: "+225" },
  { value: "HR", label: "Croatia", code: "+385" },
  { value: "CW", label: "Curaçao", code: "+599" },
  { value: "CY", label: "Cyprus", code: "+357" },
  { value: "CZ", label: "Czechia", code: "+420" },
  { value: "CD", label: "Democratic Republic of the Congo", code: "+243" },
  { value: "DK", label: "Denmark", code: "+45" },
  { value: "DJ", label: "Djibouti", code: "+253" },
  { value: "DM", label: "Dominica", code: "+1" },
  { value: "DO", label: "Dominican Republic", code: "+1" },
  { value: "EC", label: "Ecuador", code: "+593" },
  { value: "EG", label: "Egypt", code: "+20" },
  { value: "SV", label: "El Salvador", code: "+503" },
  { value: "GQ", label: "Equatorial Guinea", code: "+240" },
  { value: "ER", label: "Eritrea", code: "+291" },
  { value: "EE", label: "Estonia", code: "+372" },
  { value: "SZ", label: "Eswatini", code: "+268" },
  { value: "ET", label: "Ethiopia", code: "+251" },
  { value: "FK", label: "Falkland Islands", code: "+500" },
  { value: "FO", label: "Faroe Islands", code: "+298" },
  { value: "FJ", label: "Fiji", code: "+679" },
  { value: "FI", label: "Finland", code: "+358" },
  { value: "FR", label: "France", code: "+33" },
  { value: "GF", label: "French Guiana", code: "+594" },
  { value: "PF", label: "French Polynesia", code: "+689" },
  { value: "TF", label: "French Southern Territories", code: "+262" },
  { value: "GA", label: "Gabon", code: "+241" },
  { value: "GM", label: "Gambia", code: "+220" },
  { value: "GE", label: "Georgia", code: "+995" },
  { value: "DE", label: "Germany", code: "+49" },
  { value: "GH", label: "Ghana", code: "+233" },
  { value: "GI", label: "Gibraltar", code: "+350" },
  { value: "GR", label: "Greece", code: "+30" },
  { value: "GL", label: "Greenland", code: "+299" },
  { value: "GD", label: "Grenada", code: "+1" },
  { value: "GP", label: "Guadeloupe", code: "+590" },
  { value: "GU", label: "Guam", code: "+1" },
  { value: "GT", label: "Guatemala", code: "+502" },
  { value: "GG", label: "Guernsey", code: "+44" },
  { value: "GN", label: "Guinea", code: "+224" },
  { value: "GNB", label: "Guinea-Bissau", code: "+245" },
  { value: "GY", label: "Guyana", code: "+592" },
  { value: "HT", label: "Haiti", code: "+509" },
  { value: "HM", label: "Heard And Mc Donald Islands", code: "+61" },
  { value: "HN", label: "Honduras", code: "+504" },
  { value: "HK", label: "Hong Kong", code: "+852" },
  { value: "HU", label: "Hungary", code: "+36" },
  { value: "IS", label: "Iceland", code: "+354" },
  { value: "IN", label: "India", code: "+91" },
  { value: "ID", label: "Indonesia", code: "+62" },
  { value: "IQ", label: "Iraq", code: "+964" },
  { value: "IE", label: "Ireland", code: "+353" },
  { value: "IM", label: "Isle of Man", code: "+44" },
  { value: "IL", label: "Israel", code: "+972" },
  { value: "IT", label: "Italy", code: "+39" },
  { value: "JM", label: "Jamaica", code: "+1" },
  { value: "JP", label: "Japan", code: "+81" },
  { value: "JE", label: "Jersey", code: "+44" },
  { value: "JO", label: "Jordan", code: "+962" },
  { value: "KZ", label: "Kazakhstan", code: "+7" },
  { value: "KE", label: "Kenya", code: "+254" },
  { value: "KI", label: "Kiribati", code: "+686" },
  { value: "XK", label: "Kosovo", code: "+383" },
  { value: "KW", label: "Kuwait", code: "+965" },
  { value: "KG", label: "Kyrgyzstan", code: "+996" },
  { value: "LA", label: "Laos", code: "+856" },
  { value: "LV", label: "Latvia", code: "+371" },
  { value: "LB", label: "Lebanon", code: "+961" },
  { value: "LS", label: "Lesotho", code: "+266" },
  { value: "LR", label: "Liberia", code: "+231" },
  { value: "LY", label: "Libya", code: "+218" },
  { value: "LI", label: "Liechtenstein", code: "+423" },
  { value: "LT", label: "Lithuania", code: "+370" },
  { value: "LU", label: "Luxembourg", code: "+352" },
  { value: "MO", label: "Macao", code: "+853" },
  { value: "MG", label: "Madagascar", code: "+261" },
  { value: "MW", label: "Malawi", code: "+265" },
  { value: "MY", label: "Malaysia", code: "+60" },
  { value: "MV", label: "Maldives", code: "+960" },
  { value: "ML", label: "Mali", code: "+223" },
  { value: "MT", label: "Malta", code: "+356" },
  { value: "MH", label: "Marshall Islands", code: "+692" },
  { value: "MQ", label: "Martinique", code: "+596" },
  { value: "MR", label: "Mauritania", code: "+222" },
  { value: "MU", label: "Mauritius", code: "+230" },
  { value: "YT", label: "Mayotte", code: "+262" },
  { value: "MX", label: "Mexico", code: "+52" },
  { value: "FM", label: "Micronesia", code: "+691" },
  { value: "MD", label: "Moldova", code: "+373" },
  { value: "MC", label: "Monaco", code: "+377" },
  { value: "MN", label: "Mongolia", code: "+976" },
  { value: "ME", label: "Montenegro", code: "+382" },
  { value: "MS", label: "Montserrat", code: "+1" },
  { value: "MA", label: "Morocco", code: "+212" },
  { value: "MZ", label: "Mozambique", code: "+258" },
  { value: "MM", label: "Myanmar", code: "+95" },
  { value: "NA", label: "Namibia", code: "+264" },
  { value: "NR", label: "Nauru", code: "+674" },
  { value: "NP", label: "Nepal", code: "+977" },
  { value: "NL", label: "Netherlands", code: "+31" },
  { value: "NC", label: "New Caledonia", code: "+687" },
  { value: "NZ", label: "New Zealand", code: "+64" },
  { value: "NI", label: "Nicaragua", code: "+505" },
  { value: "NE", label: "Niger", code: "+227" },
  { value: "NG", label: "Nigeria", code: "+234" },
  { value: "NU", label: "Niue", code: "+683" },
  { value: "MP", label: "Northern Mariana Islands", code: "+1" },
  { value: "MK", label: "North Macedonia", code: "+389" },
  { value: "NO", label: "Norway", code: "+47" },
  { value: "OM", label: "Oman", code: "+968" },
  { value: "PK", label: "Pakistan", code: "+92" },
  { value: "PW", label: "Palau", code: "+680" },
  { value: "PS", label: "Palestinian Territories", code: "+970" },
  { value: "PA", label: "Panama", code: "+507" },
  { value: "PG", label: "Papua New Guinea", code: "+675" },
  { value: "PY", label: "Paraguay", code: "+595" },
  { value: "PE", label: "Peru", code: "+51" },
  { value: "PH", label: "Philippines", code: "+63" },
  { value: "PN", label: "Pitcairn", code: "+870" },
  { value: "PL", label: "Poland", code: "+48" },
  { value: "PT", label: "Portugal", code: "+351" },
  { value: "PR", label: "Puerto Rico", code: "+1" },
  { value: "QA", label: "Qatar", code: "+974" },
  { value: "CG", label: "Republic of the Congo", code: "+242" },
  { value: "RE", label: "Réunion", code: "+262" },
  { value: "RO", label: "Romania", code: "+40" },
  { value: "RU", label: "Russia", code: "+7" },
  { value: "RW", label: "Rwanda", code: "+250" },
  { value: "BL", label: "Saint Barthélemy", code: "+590" },
  { value: "SH", label: "Saint Helena", code: "+290" },
  { value: "KN", label: "Saint Kitts And Nevis", code: "+1" },
  { value: "LC", label: "Saint Lucia", code: "+1" },
  { value: "MF", label: "Saint Martin", code: "+1" },
  { value: "VC", label: "Saint Vincent and the Grenadines", code: "+1" },
  { value: "WS", label: "Samoa", code: "+685" },
  { value: "SM", label: "San Marino", code: "+378" },
  { value: "ST", label: "Sao Tome And Principe", code: "+239" },
  { value: "SA", label: "Saudi Arabia", code: "+966" },
  { value: "SN", label: "Senegal", code: "+221" },
  { value: "RS", label: "Serbia", code: "+381" },
  { value: "SC", label: "Seychelles", code: "+248" },
  { value: "SL", label: "Sierra Leone", code: "+232" },
  { value: "SG", label: "Singapore", code: "+65" },
  { value: "SX", label: "Sint Maarten", code: "+1" },
  { value: "SK", label: "Slovakia", code: "+421" },
  { value: "SI", label: "Slovenia", code: "+386" },
  { value: "SB", label: "Solomon Islands", code: "+677" },
  { value: "SO", label: "Somalia", code: "+252" },
  { value: "ZA", label: "South Africa", code: "+27" },
  { value: "KR", label: "South Korea", code: "+82" },
  { value: "SS", label: "South Sudan", code: "+211" },
  { value: "ES", label: "Spain", code: "+34" },
  { value: "LK", label: "Sri Lanka", code: "+94" },
  { value: "PM", label: "St. Pierre And Miquelon", code: "+508" },
  { value: "SD", label: "Sudan", code: "+249" },
  { value: "SR", label: "Suriname", code: "+597" },
  { value: "SJ", label: "Svalbard And Jan Mayen Islands", code: "+47" },
  { value: "SE", label: "Sweden", code: "+46" },
  { value: "CH", label: "Switzerland", code: "+41" },
  { value: "TW", label: "Taiwan", code: "+886" },
  { value: "TJ", label: "Tajikistan", code: "+992" },
  { value: "TZ", label: "Tanzania", code: "+255" },
  { value: "TH", label: "Thailand", code: "+66" },
  { value: "TL", label: "Timor-Leste", code: "+670" },
  { value: "TG", label: "Togo", code: "+228" },
  { value: "TK", label: "Tokelau", code: "+690" },
  { value: "TO", label: "Tonga", code: "+676" },
  { value: "TT", label: "Trinidad and Tobago", code: "+1" },
  { value: "TN", label: "Tunisia", code: "+216" },
  { value: "TR", label: "Türkiye", code: "+90" },
  { value: "TM", label: "Turkmenistan", code: "+993" },
  { value: "TC", label: "Turks and Caicos Islands", code: "+1" },
  { value: "TV", label: "Tuvalu", code: "+688" },
  { value: "UG", label: "Uganda", code: "+256" },
  { value: "UA", label: "Ukraine", code: "+380" },
  { value: "AE", label: "United Arab Emirates", code: "+971" },
  { value: "GB", label: "United Kingdom", code: "+44" },
  { value: "US", label: "United States", code: "+1" },
  { value: "UY", label: "Uruguay", code: "+598" },
  { value: "UZ", label: "Uzbekistan", code: "+998" },
  { value: "VU", label: "Vanuatu", code: "+678" },
  { value: "VA", label: "Vatican", code: "+39" },
  { value: "VE", label: "Venezuela", code: "+58" },
  { value: "VN", label: "Vietnam", code: "+84" },
  { value: "VI", label: "Virgin Islands (U.S.)", code: "+1" },
  { value: "WF", label: "Wallis And Futuna Islands", code: "+681" },
  { value: "EH", label: "Western Sahara", code: "+212" },
  { value: "YE", label: "Yemen", code: "+967" },
  { value: "ZM", label: "Zambia", code: "+260" },
  { value: "ZW", label: "Zimbabwe", code: "+263" },
];

export const ZPRIA_CORNER_LOGO = ({ className = '', color }: { className?: string; color?: string }) => (
  <svg className={className} style={color ? { color } : {}} viewBox="0 0 100 30" xmlns="http://www.w3.org/2000/svg" fill="none">
    {/* Symbol: Build IN (2s) → Stay (10s) → Build OUT (1.5s) = 13.5s total */}
    <g transform="translate(15, 15)">
      <rect x="-8.2" y="-7.2" width="10.5" height="10.5" fill="#7C3AED" rx="1.7">
        <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="0.5;1.05;1;1;0.5" keyTimes="0;0.1;0.15;0.89;1" dur="13.5s" repeatCount="indefinite"/>
      </rect>
      <rect x="-2.8" y="-3.8" width="10.5" height="10.5" fill="#06B6D4" rx="1.7">
        <animate attributeName="opacity" values="0;0.85;0.85;0.85;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="scale" values="0.5;1.05;1;1;0.5" keyTimes="0;0.1;0.15;0.89;1" dur="13.5s" repeatCount="indefinite"/>
      </rect>
      <circle cx="3.8" cy="3.3" r="2.5" fill="white">
        <animate attributeName="opacity" values="0;0.25;0.25;0.25;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
      </circle>
      <g>
        <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="translate" values="0,-4;0,0.4;0,0;0,0;0,-4" keyTimes="0;0.1;0.15;0.89;1" dur="13.5s" repeatCount="indefinite"/>
        <circle cx="-7.9" cy="4.8" r="0.72" fill="#EC4899"/>
        <circle cx="-6.1" cy="4.8" r="0.72" fill="#EC4899"/>
        <circle cx="-4.3" cy="4.8" r="0.72" fill="#EC4899"/>
      </g>
      <circle cx="6.3" cy="5.8" r="1.45" fill="#10B981">
        <animate attributeName="opacity" values="0;1;1;1;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="translate" values="0,-6;0,0.6;0,0;0,0;0,-6" keyTimes="0;0.1;0.15;0.89;1" dur="13.5s" repeatCount="indefinite"/>
      </circle>
      <rect x="-1.7" y="0" width="4.6" height="0.62" fill="white" rx="0.31">
        <animate attributeName="opacity" values="0;0.25;0.25;0.25;0" keyTimes="0;0.15;0.89;0.89;1" dur="13.5s" repeatCount="indefinite"/>
      </rect>
    </g>
    {/* Text: breathing animation */}
    <text x="29.5" y="19.2" fontFamily="'Segoe UI', -apple-system, sans-serif" fontSize="12.5" fontWeight="700" fill="currentColor" letterSpacing="-0.25">
      ZPRIA
      <animate attributeName="fontSize" values="12.5;12.7;12.5" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="fillOpacity" values="1;0.95;1" dur="2s" repeatCount="indefinite"/>
    </text>
  </svg>
);

export const ZPRIA_MAIN_LOGO = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" fill="none">
    <g transform="translate(100, 100)">
      {/* Purple square slides from left */}
      <rect x="-42" y="-35" width="50" height="50" fill="#7C3AED" rx="8" opacity="0">
        <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
        <animateTransform attributeName="transform" type="translate" values="-100,0; 0,0" dur="0.8s" fill="freeze"/>
      </rect>
      
      {/* Cyan square slides from right */}
      <rect x="-15" y="-18" width="50" height="50" fill="#06B6D4" rx="8" opacity="0">
        <animate attributeName="opacity" values="0;0.85" begin="0.3s" dur="0.5s" fill="freeze"/>
        <animateTransform attributeName="transform" type="translate" values="100,0; 0,0" begin="0.3s" dur="0.8s" fill="freeze"/>
      </rect>
      
      {/* White circle fades in */}
      <circle cx="18" cy="15" r="12" fill="white" opacity="0">
        <animate attributeName="opacity" values="0;0.25" begin="0.8s" dur="0.4s" fill="freeze"/>
        <animateTransform attributeName="transform" type="scale" values="0;1" begin="0.8s" dur="0.4s" fill="freeze"/>
      </circle>
      
      {/* Pink dots pop in sequentially */}
      <circle cx="-39" cy="23" r="3.5" fill="#EC4899" opacity="0">
        <animate attributeName="opacity" values="0;1" begin="1.2s" dur="0.2s" fill="freeze"/>
        <animateTransform attributeName="transform" type="scale" values="0;1.3;1" begin="1.2s" dur="0.3s" fill="freeze"/>
      </circle>
      <circle cx="-30" cy="23" r="3.5" fill="#EC4899" opacity="0">
        <animate attributeName="opacity" values="0;1" begin="1.4s" dur="0.2s" fill="freeze"/>
        <animateTransform attributeName="transform" type="scale" values="0;1.3;1" begin="1.4s" dur="0.3s" fill="freeze"/>
      </circle>
      <circle cx="-21" cy="23" r="3.5" fill="#EC4899" opacity="0">
        <animate attributeName="opacity" values="0;1" begin="1.6s" dur="0.2s" fill="freeze"/>
        <animateTransform attributeName="transform" type="scale" values="0;1.3;1" begin="1.6s" dur="0.3s" fill="freeze"/>
      </circle>
      
      {/* Green dot drops from top */}
      <circle cx="30" cy="28" r="7" fill="#10B981" opacity="0">
        <animate attributeName="opacity" values="0;1" begin="1.8s" dur="0.2s" fill="freeze"/>
        <animateTransform attributeName="transform" type="translate" values="0,-50; 0,5; 0,0" begin="1.8s" dur="0.5s" fill="freeze"/>
      </circle>
      
      {/* White bar slides in */}
      <rect x="-8" y="0" width="22" height="3" fill="white" rx="1.5" opacity="0">
        <animate attributeName="opacity" values="0;0.25" begin="2.0s" dur="0.3s" fill="freeze"/>
        <animateTransform attributeName="transform" type="scale" values="0,1; 1,1" begin="2.0s" dur="0.4s" fill="freeze"/>
      </rect>
    </g>
  </svg>
);
