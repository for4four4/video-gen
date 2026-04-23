import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-white/[0.06] mt-32">
      <div className="container py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <span className="font-display text-xl">Imagination<span className="text-accent">.ai</span></span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Все ИИ-модели для генерации изображений и видео в одном чате.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Продукт</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/models" className="hover:text-foreground transition-colors">Модели</Link></li>
              <li><Link to="/pricing" className="hover:text-foreground transition-colors">Тарифы</Link></li>
              <li><Link to="/chat" className="hover:text-foreground transition-colors">Чат</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Контент</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Блог</Link></li>
              <li><Link to="/news" className="hover:text-foreground transition-colors">Новости</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Юр. инфо</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Оферта</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Политика</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Imagination AI. Все права защищены.</p>
          <p>Сделано с любовью к нейросетям</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
