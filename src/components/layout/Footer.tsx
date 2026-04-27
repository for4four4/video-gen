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
              <li><Link to="/reviews" className="hover:text-foreground transition-colors">Отзывы</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Контент</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Блог</Link></li>
              <li><Link to="/news" className="hover:text-foreground transition-colors">Новости</Link></li>
              <li><Link to="/faq" className="hover:text-foreground transition-colors">Вопросы и ответы</Link></li>
              <li><Link to="/contacts" className="hover:text-foreground transition-colors">Контакты</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-4">Юр. инфо</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/legal/offer" className="hover:text-foreground transition-colors">Оферта</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-foreground transition-colors">Конфиденциальность</Link></li>
              <li><Link to="/legal/usage" className="hover:text-foreground transition-colors">Использование</Link></li>
              <li><Link to="/legal/cookies" className="hover:text-foreground transition-colors">Cookie</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Imagination AI. Все права защищены.</p>
          <p>ООО «Имеджинейшн ЭйАй» · ИНН 7714123456</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
