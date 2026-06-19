import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/510e6d66-95ba-4972-bdd6-f06b4681996d/files/c03d9d48-71e8-4fe6-8f28-c9cb72ae5f0c.jpg';

const DONATE_URL = 'https://www.donationalerts.com/r/77_Timoha';

interface Product {
  id: number;
  name: string;
  price: number;
  icon: string;
  tag?: string;
  glow: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Brawl Pass', price: 1100, icon: 'Ticket', tag: 'ХИТ', glow: 'from-primary to-amber-500' },
  { id: 2, name: 'Brawl Pass Plus', price: 1430, icon: 'Crown', tag: 'ТОП', glow: 'from-secondary to-fuchsia-500' },
  { id: 12, name: 'Про Пасс', price: 3000, icon: 'ShieldCheck', tag: 'PRO', glow: 'from-primary to-yellow-400' },
  { id: 3, name: '30 гемов', price: 230, icon: 'Gem', glow: 'from-accent to-cyan-400' },
  { id: 4, name: '80 гемов', price: 560, icon: 'Gem', glow: 'from-accent to-cyan-400' },
  { id: 5, name: '170 гемов', price: 1120, icon: 'Gem', glow: 'from-accent to-cyan-400' },
  { id: 6, name: '360 гемов', price: 2240, icon: 'Gem', tag: 'ВЫГОДА', glow: 'from-accent to-cyan-400' },
  { id: 7, name: '950 гемов', price: 5600, icon: 'Gems', glow: 'from-secondary to-purple-500' },
  { id: 8, name: '2000 гемов', price: 11200, icon: 'Sparkles', tag: 'МАКС', glow: 'from-primary to-orange-500' },
  { id: 9, name: 'Эпический скин', price: 990, icon: 'Shirt', glow: 'from-secondary to-pink-500' },
  { id: 10, name: 'Мифический скин', price: 1690, icon: 'Wand2', glow: 'from-accent to-blue-500' },
  { id: 11, name: 'Легендарный скин', price: 2490, icon: 'Flame', tag: 'РЕДКОСТЬ', glow: 'from-primary to-red-500' },
];

const REVIEWS = [
  { name: 'Артём', text: 'Закинул гемы за пару минут, всё пришло! Тимоха топ 🔥', rating: 5 },
  { name: 'Karina', text: 'Брал пасс плюс — дешевле чем в игре. Рекомендую!', rating: 5 },
  { name: 'NeoGamer', text: 'Скин легендарный дошёл быстро, спасибо за помощь.', rating: 5 },
  { name: 'Дима', text: 'Сначала боялся, но всё честно. 2000 гемов получил.', rating: 5 },
];

const Index = () => {
  const [cart, setCart] = useState<Product[]>([]);
  const [buyProduct, setBuyProduct] = useState<Product | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [orderStatus, setOrderStatus] = useState<'idle' | 'processing'>('idle');

  const addToCart = (p: Product) => {
    setCart((c) => [...c, p]);
    toast.success(`${p.name} добавлен в корзину`);
  };

  const removeFromCart = (idx: number) => {
    setCart((c) => c.filter((_, i) => i !== idx));
  };

  const cartTotal = cart.reduce((s, p) => s + p.price, 0);

  const openBuy = (p: Product) => {
    setBuyProduct(p);
    setEmail('');
    setCode('');
    setOrderStatus('idle');
  };

  const handlePay = () => {
    if (!email || !code) {
      toast.error('Заполни почту и код от Supercell');
      return;
    }
    setOrderStatus('processing');
    window.open(DONATE_URL, '_blank');
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <button onClick={() => scrollTo('home')} className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center animate-glow">
              <Icon name="Gamepad2" size={20} className="text-background" />
            </div>
            <span className="font-display text-xl tracking-wide">
              Тимоха<span className="text-primary">777</span>shop
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => scrollTo('home')} className="hover:text-primary transition-colors">Главная</button>
            <button onClick={() => scrollTo('catalog')} className="hover:text-primary transition-colors">Каталог</button>
            <button onClick={() => scrollTo('reviews')} className="hover:text-primary transition-colors">Отзывы</button>
          </nav>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary" className="relative rounded-xl">
                <Icon name="ShoppingCart" size={18} />
                <span className="hidden sm:inline ml-2">Корзина</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-primary text-background text-xs font-bold flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border flex flex-col">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">Корзина</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {cart.length === 0 && (
                  <div className="text-center text-muted-foreground py-16">
                    <Icon name="PackageOpen" size={48} className="mx-auto mb-3 opacity-50" />
                    Корзина пуста
                  </div>
                )}
                {cart.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-muted rounded-xl p-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${p.glow} flex items-center justify-center shrink-0`}>
                      <Icon name={p.icon} size={20} className="text-background" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-primary font-bold">{p.price} ₽</p>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-muted-foreground hover:text-destructive">
                      <Icon name="Trash2" size={18} />
                    </button>
                  </div>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-lg">
                    <span>Итого:</span>
                    <span className="font-display text-2xl text-primary">{cartTotal} ₽</span>
                  </div>
                  <Button
                    className="w-full rounded-xl h-12 text-base font-bold bg-gradient-to-r from-primary to-amber-500 text-background hover:opacity-90"
                    onClick={() => openBuy({ id: 0, name: `Корзина (${cart.length} товаров)`, price: cartTotal, icon: 'ShoppingBag', glow: 'from-primary to-amber-500' })}
                  >
                    Оформить заказ
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden hero-grid">
        <div className="container py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 bg-muted px-4 py-1.5 rounded-full text-sm text-accent font-medium mb-5">
              <Icon name="Zap" size={14} /> Brawl Stars донат №1
            </span>
            <h1 className="font-display text-5xl md:text-6xl leading-tight mb-5">
              Гемы, пропуски <br />и скины <span className="text-gradient">выгодно</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              Быстрая доставка гемов, Brawl Pass и эксклюзивных скинов прямо на твой аккаунт Supercell.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => scrollTo('catalog')} className="rounded-xl h-12 px-7 text-base font-bold bg-gradient-to-r from-primary to-amber-500 text-background hover:opacity-90">
                <Icon name="Rocket" size={18} className="mr-2" /> В каталог
              </Button>
              <Button onClick={() => scrollTo('reviews')} variant="secondary" className="rounded-xl h-12 px-7 text-base">
                Отзывы
              </Button>
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30 blur-3xl rounded-full" />
            <img src={HERO_IMG} alt="Brawl Stars" className="relative rounded-3xl border border-border shadow-2xl" />
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl mb-3">Каталог <span className="text-gradient">товаров</span></h2>
          <p className="text-muted-foreground">Выбери что нужно — и забирай по лучшей цене</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCTS.map((p) => (
            <div
              key={p.id}
              className="group relative bg-card border border-border rounded-2xl p-5 hover:border-primary/60 transition-all hover:-translate-y-1"
            >
              {p.tag && (
                <span className="absolute top-4 right-4 bg-primary text-background text-xs font-bold px-2.5 py-1 rounded-full">
                  {p.tag}
                </span>
              )}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${p.glow} flex items-center justify-center mb-4 group-hover:animate-glow`}>
                <Icon name={p.icon} size={28} className="text-background" />
              </div>
              <h3 className="font-display text-xl mb-1">{p.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Brawl Stars</p>
              <div className="flex items-center justify-between">
                <span className="font-display text-2xl text-primary">{p.price} ₽</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="secondary" className="rounded-xl" onClick={() => addToCart(p)}>
                    <Icon name="Plus" size={18} />
                  </Button>
                  <Button className="rounded-xl font-bold bg-gradient-to-r from-primary to-amber-500 text-background hover:opacity-90" onClick={() => openBuy(p)}>
                    Купить
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="container py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl mb-3">Отзывы <span className="text-gradient">покупателей</span></h2>
          <p className="text-muted-foreground">Нам доверяют сотни игроков</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {REVIEWS.map((r, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex gap-1 mb-3 text-primary">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Icon key={j} name="Star" size={16} className="fill-primary" />
                ))}
              </div>
              <p className="text-sm mb-4 text-foreground/90">«{r.text}»</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center text-sm font-bold">
                  {r.name[0]}
                </div>
                <span className="font-medium text-sm">{r.name}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-10">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-display text-lg text-foreground">Тимоха<span className="text-primary">777</span>shop</span>
          <span>© {new Date().getFullYear()} Все товары доставляются вручную</span>
        </div>
      </footer>

      {/* Buy Dialog */}
      <Dialog open={!!buyProduct} onOpenChange={(o) => !o && setBuyProduct(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {orderStatus === 'idle' ? 'Оформление заказа' : 'Заказ принят'}
            </DialogTitle>
            <DialogDescription>
              {buyProduct?.name} — <span className="text-primary font-bold">{buyProduct?.price} ₽</span>
            </DialogDescription>
          </DialogHeader>

          {orderStatus === 'idle' ? (
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Почта</label>
                <Input
                  type="email"
                  placeholder="example@mail.ru"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-input border-border h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Код от Supercell ID</label>
                <Input
                  placeholder="Введи код подтверждения"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="bg-input border-border h-11 rounded-xl"
                />
              </div>
              <Button
                className="w-full h-12 rounded-xl text-base font-bold bg-gradient-to-r from-primary to-amber-500 text-background hover:opacity-90"
                onClick={handlePay}
              >
                <Icon name="CreditCard" size={18} className="mr-2" /> Купить и оплатить
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                После оплаты заказ будет выполнен вручную в течение короткого времени
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-5">
              <div className="bg-muted rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon name="Loader" size={20} className="text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-bold text-primary">Заказ выполняется</p>
                  <p className="text-sm text-muted-foreground">
                    Заверши оплату на открывшейся странице. После проверки я подтвержу заказ — и он будет помечен как «Заказ выполнен».
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3 opacity-60">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                  <Icon name="CheckCircle2" size={20} className="text-accent" />
                </div>
                <div>
                  <p className="font-bold">Заказ выполнен</p>
                  <p className="text-sm text-muted-foreground">
                    Статус обновится после подтверждения продавцом.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                className="w-full h-11 rounded-xl"
                onClick={() => window.open(DONATE_URL, '_blank')}
              >
                <Icon name="ExternalLink" size={16} className="mr-2" /> Открыть оплату снова
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setBuyProduct(null)}>
                Закрыть
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;