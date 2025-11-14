import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";
import "../assets/css/Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-grid">
        
        {/* Sección 1 - Información */}
        <motion.div className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-white text-xl font-semibold mb-3">Nemcatacoa</h2>
          <p className="text-sm leading-relaxed">
            Plataforma que conecta viajeros con experiencias auténticas, itinerarios inteligentes y
            aliados locales en toda Colombia. Transformamos cada paso del viaje en un recuerdo
            memorable.
          </p>
        </motion.div>

        {/* Sección 2 - Contacto */}
        <motion.div className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-white text-xl font-semibold mb-3">Contacto</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} /> nemcatacoa@gmail.com
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +57 310 509 8482 
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Bogotá, Colombia
            </li>
          </ul>
        </motion.div>

        {/* Sección 3 - Redes Sociales */}
        <motion.div className="footer-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h2 className="text-white text-xl font-semibold mb-3">Síguenos</h2>
          <div className="flex gap-4">
            <a
              href="https://facebook.com/Fanny_Rhlm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="social-link"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://instagram.com/lightness.08"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="social-link"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://linkedin.com/company/nemcatacoa"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="social-link"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Línea inferior */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} Nemcatacoa — Movemos tus viajes por Colombia.
      </div>
    </footer>
  );
}
