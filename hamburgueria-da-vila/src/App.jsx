import React, { useMemo, useState } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Clock,
  Star,
  Search,
  MessageCircle,
  Flame,
  Bike,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Número que receberá os pedidos no WhatsApp.
// Use o formato com código do país + DDD + número, sem espaços ou símbolos.
const WHATSAPP_NUMBER = "5599999999999";

// Taxa fixa de entrega usada no cálculo final do carrinho.
const DELIVERY_FEE = 5;

// Lista principal de produtos do cardápio.
// Para adicionar novos itens, basta repetir a estrutura abaixo com um novo id.
const products = [
  {
    id: 1,
    name: "Vila Smash",
    category: "burgers",
    price: 22.9,
    highlight: true,
    description: "Pão brioche, burger smash 120g, queijo cheddar, cebola caramelizada e molho da Vila.",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Duplo da Vila",
    category: "burgers",
    price: 34.9,
    highlight: true,
    description: "Dois burgers artesanais, cheddar duplo, bacon crocante, alface, tomate e maionese especial.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Chicken Crispy",
    category: "burgers",
    price: 29.9,
    description: "Frango empanado crocante, queijo prato, alface americana e molho barbecue.",
    image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Vila Bacon",
    category: "burgers",
    price: 32.9,
    description: "Burger 160g, queijo cheddar, bacon em tiras, cebola crispy e molho defumado.",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Batata da Casa",
    category: "sides",
    price: 18.9,
    description: "Batata frita crocante com cheddar cremoso, bacon e cheiro-verde.",
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Onion Rings",
    category: "sides",
    price: 16.9,
    description: "Anéis de cebola empanados, sequinhos e crocantes, acompanha molho especial.",
    image: "https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 7,
    name: "Coca-Cola Lata",
    category: "drinks",
    price: 7,
    description: "350ml gelada.",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 8,
    name: "Guaraná Lata",
    category: "drinks",
    price: 7,
    description: "350ml gelado.",
    image: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=900&q=80",
  },
];

// Categorias usadas nos botões de filtro do cardápio.
// O id precisa bater com a propriedade category dos produtos.
const categories = [
  { id: "all", label: "Todos" },
  { id: "burgers", label: "Hambúrgueres" },
  { id: "sides", label: "Porções" },
  { id: "drinks", label: "Bebidas" },
];

// Adicionais disponíveis apenas para produtos da categoria "burgers".
const extras = [
  { id: "bacon", label: "+ Bacon", price: 5 },
  { id: "cheddar", label: "+ Cheddar", price: 4 },
  { id: "burger", label: "+ Burger", price: 9 },
];

// Formata valores numéricos para moeda brasileira.
function formatCurrency(value) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function App() {
  // Guarda todos os itens adicionados ao carrinho.
  const [cart, setCart] = useState([]);

  // Controla qual categoria está selecionada no filtro do cardápio.
  const [category, setCategory] = useState("all");

  // Guarda o texto digitado no campo de busca.
  const [search, setSearch] = useState("");

  // Dados preenchidos pelo cliente no fechamento do pedido.
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState("Pix");
  const [notes, setNotes] = useState("");

  // Guarda os adicionais selecionados por produto.
  // Exemplo: { 1: ["bacon", "cheddar"] } significa que o produto de id 1 recebeu esses adicionais.
  const [selectedExtras, setSelectedExtras] = useState({});

  // Controla se o painel lateral do carrinho está aberto ou fechado.
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Filtra os produtos por categoria e também pelo texto pesquisado.
  // useMemo evita recalcular a lista filtrada sem necessidade a cada renderização.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [category, search]);

  // Soma todos os itens do carrinho considerando preço unitário e quantidade.
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);

  // Adiciona a taxa de entrega somente quando existe pelo menos um item no carrinho.
  const total = cart.length > 0 ? subtotal + DELIVERY_FEE : 0;

  // Conta quantos produtos existem no carrinho, somando as quantidades.
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  function toggleExtra(productId, extraId) {
    setSelectedExtras((prev) => {
      // Busca os adicionais já marcados para esse produto específico.
      const current = prev[productId] || [];

      // Verifica se o adicional clicado já estava selecionado.
      const exists = current.includes(extraId);

      return {
        ...prev,

        // Se já existe, remove. Se não existe, adiciona.
        [productId]: exists ? current.filter((id) => id !== extraId) : [...current, extraId],
      };
    });
  }

  function addToCart(product) {
    // Converte os ids dos adicionais selecionados em objetos completos com label e preço.
    const productExtras = extras.filter((extra) => (selectedExtras[product.id] || []).includes(extra.id));

    // Soma o valor de todos os adicionais escolhidos para este produto.
    const extraTotal = productExtras.reduce((sum, extra) => sum + extra.price, 0);

    // Cria uma chave única para diferenciar o mesmo produto com adicionais diferentes.
    // Exemplo: Vila Smash com bacon não deve ser agrupado com Vila Smash sem bacon.
    const key = `${product.id}-${productExtras.map((extra) => extra.id).join("-")}`;

    setCart((prev) => {
      // Verifica se já existe no carrinho um item exatamente igual, incluindo adicionais.
      const existing = prev.find((item) => item.key === key);

      // Se já existe, apenas aumenta a quantidade.
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      // Se ainda não existe, adiciona um novo item ao carrinho.
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          basePrice: product.price,
          extras: productExtras,
          totalPrice: product.price + extraTotal,
          quantity: 1,
        },
      ];
    });

    // Abre o carrinho automaticamente depois que um produto é adicionado.
    setIsCartOpen(true);
  }

  function updateQuantity(key, action) {
    setCart((prev) =>
      prev
        // Aumenta ou diminui a quantidade do item selecionado.
        .map((item) =>
          item.key === key
            ? { ...item, quantity: action === "plus" ? item.quantity + 1 : item.quantity - 1 }
            : item
        )
        // Remove automaticamente o item se a quantidade chegar a zero.
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(key) {
    // Remove do carrinho apenas o item com a chave correspondente.
    setCart((prev) => prev.filter((item) => item.key !== key));
  }

  function finishOrder() {
    // Validações simples antes de abrir o WhatsApp.
    if (!cart.length) return alert("Adicione pelo menos um item ao carrinho.");
    if (!address.trim()) return alert("Informe o endereço de entrega.");

    // Monta a lista de itens em formato de texto para enviar ao WhatsApp.
    const itemsText = cart
      .map((item) => {
        const extrasText = item.extras.length
          ? `\n   Adicionais: ${item.extras.map((extra) => extra.label).join(", ")}`
          : "";

        return `• ${item.quantity}x ${item.name}${extrasText}\n   Valor: ${formatCurrency(
          item.totalPrice * item.quantity
        )}`;
      })
      .join("\n\n");

    // encodeURIComponent evita erro com espaços, acentos e quebras de linha dentro do link do WhatsApp.
    const message = `Olá! Quero fazer um pedido na Hamburgueria da Vila.%0A%0A${encodeURIComponent(
      itemsText
    )}%0A%0ASubtotal: ${encodeURIComponent(
      formatCurrency(subtotal)
    )}%0ATaxa de entrega: ${encodeURIComponent(formatCurrency(DELIVERY_FEE))}%0ATotal: ${encodeURIComponent(
      formatCurrency(total)
    )}%0A%0AEndereço: ${encodeURIComponent(address)}%0APagamento: ${encodeURIComponent(
      payment
    )}%0AObservações: ${encodeURIComponent(notes || "Nenhuma")}`;

    // Abre uma nova aba com o pedido já preenchido no WhatsApp.
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#130b08] text-white">
      {/* HERO / TOPO DO SITE */}
      <header className="relative overflow-hidden border-b border-white/10">
        {/* Camada de fundo com gradiente para dar profundidade visual. */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f97316_0%,transparent_32%),linear-gradient(135deg,#130b08_0%,#2a1208_50%,#0f0a07_100%)] opacity-90" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-[1.1fr_.9fr] md:px-8 md:py-16">
          {/* Bloco de textos principais do topo. */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-white/10 px-4 py-2 text-sm text-orange-100 backdrop-blur">
              <Flame size={16} /> Aberto hoje • 18h às 23h
            </div>

            <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight md:text-7xl">
              Hamburgueria <span className="text-orange-400">da Vila</span>
            </h1>

            <p className="mt-5 max-w-2xl text-lg text-orange-50/80 md:text-xl">
              Hambúrguer artesanal, batata crocante e aquele molho especial que deixa o pedido com sabor de quero mais.
            </p>

            {/* Cards rápidos com informações de funcionamento. */}
            <div className="mt-8 grid gap-3 text-sm text-orange-50/90 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <Clock className="mb-2" /> Seg a Dom
                <br />
                18:00 às 23:00
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <Bike className="mb-2" /> Delivery rápido
                <br />
                Taxa fixa {formatCurrency(DELIVERY_FEE)}
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <Star className="mb-2" /> Artesanal
                <br />
                Feito na hora
              </div>
            </div>
          </motion.div>

          {/* Imagem principal do topo com destaque de produto. */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <img
              className="h-[360px] w-full rounded-[2rem] object-cover shadow-2xl md:h-[480px]"
              src="https://images.unsplash.com/photo-1596662951482-0c4ba74a6df6?auto=format&fit=crop&w=1100&q=80"
              alt="Hambúrguer artesanal"
            />

            <div className="absolute bottom-5 left-5 right-5 rounded-3xl bg-black/55 p-5 backdrop-blur-xl">
              <p className="text-sm text-orange-200">Mais pedido da semana</p>
              <h2 className="text-2xl font-bold">Duplo da Vila + Batata</h2>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        {/* Barra fixa com título, busca e botão do carrinho. */}
        <section className="sticky top-0 z-20 -mx-5 mb-8 border-b border-white/10 bg-[#130b08]/90 px-5 py-4 backdrop-blur md:-mx-8 md:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-black">Cardápio</h2>
              <p className="text-sm text-white/60">Escolha, personalize e finalize pelo WhatsApp.</p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              {/* Campo de busca para localizar produtos pelo nome. */}
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <Search size={18} className="text-white/50" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar item"
                  className="bg-transparent outline-none placeholder:text-white/40"
                />
              </div>

              <button
                onClick={() => setIsCartOpen(true)}
                className="rounded-2xl bg-orange-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-500/20"
              >
                Carrinho ({totalItems})
              </button>
            </div>
          </div>
        </section>

        {/* Botões de categoria que alteram o filtro dos produtos. */}
        <div className="mb-8 flex gap-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`rounded-full px-5 py-3 text-sm font-bold transition ${
                category === cat.id ? "bg-orange-500 text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grade de produtos renderizada a partir da lista filtrada. */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <motion.article
              layout
              key={product.id}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[.06] shadow-xl shadow-black/20"
            >
              <div className="relative">
                <img src={product.image} alt={product.name} className="h-56 w-full object-cover" />

                {/* Selo exibido apenas para produtos marcados como destaque. */}
                {product.highlight && (
                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-black">
                    Mais vendido
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black">{product.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{product.description}</p>
                  </div>

                  <strong className="whitespace-nowrap text-xl text-orange-400">
                    {formatCurrency(product.price)}
                  </strong>
                </div>

                {/* Adicionais aparecem somente em hambúrgueres. */}
                {product.category === "burgers" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {extras.map((extra) => (
                      <button
                        key={extra.id}
                        onClick={() => toggleExtra(product.id, extra.id)}
                        className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                          selectedExtras[product.id]?.includes(extra.id)
                            ? "border-orange-400 bg-orange-500/25 text-orange-100"
                            : "border-white/10 bg-white/5 text-white/60"
                        }`}
                      >
                        {extra.label} {formatCurrency(extra.price)}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => addToCart(product)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-black text-zinc-950 transition hover:bg-orange-100"
                >
                  <Plus size={18} /> Adicionar ao pedido
                </button>
              </div>
            </motion.article>
          ))}
        </section>
      </main>

      {/* AnimatePresence permite animar a entrada e saída do carrinho lateral. */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.aside
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsCartOpen(false)}
          >
            {/* stopPropagation impede que o clique dentro do carrinho feche o painel. */}
            <motion.div
              initial={{ x: 420 }}
              animate={{ x: 0 }}
              exit={{ x: 420 }}
              transition={{ type: "spring", damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex h-full w-full max-w-md flex-col bg-[#1b100b] shadow-2xl"
            >
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-black">
                    <ShoppingCart /> Meu pedido
                  </h2>

                  <button onClick={() => setIsCartOpen(false)} className="rounded-full bg-white/10 px-3 py-1">
                    Fechar
                  </button>
                </div>
              </div>

              {/* Área rolável com os itens do carrinho e dados do cliente. */}
              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {!cart.length && (
                  <p className="rounded-2xl bg-white/5 p-5 text-white/60">Seu carrinho está vazio.</p>
                )}

                {cart.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold">{item.name}</h3>

                        {/* Mostra os adicionais do item, caso existam. */}
                        {item.extras.length > 0 && (
                          <p className="mt-1 text-xs text-orange-200">
                            {item.extras.map((extra) => extra.label).join(", ")}
                          </p>
                        )}

                        <p className="mt-2 font-bold text-orange-400">
                          {formatCurrency(item.totalPrice * item.quantity)}
                        </p>
                      </div>

                      <button onClick={() => removeItem(item.key)} className="text-white/50 hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Controles para aumentar ou diminuir a quantidade do item. */}
                    <div className="mt-4 flex items-center gap-3">
                      <button onClick={() => updateQuantity(item.key, "minus")} className="rounded-full bg-white/10 p-2">
                        <Minus size={16} />
                      </button>

                      <span className="font-bold">{item.quantity}</span>

                      <button onClick={() => updateQuantity(item.key, "plus")} className="rounded-full bg-white/10 p-2">
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Campo obrigatório para conseguir finalizar o pedido. */}
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/70">
                    <MapPin size={16} /> Endereço de entrega
                  </span>

                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows="3"
                    placeholder="Rua, número, bairro e referência"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none placeholder:text-white/30"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white/70">Forma de pagamento</span>

                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none"
                  >
                    <option>Pix</option>
                    <option>Cartão na entrega</option>
                    <option>Dinheiro</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-white/70">Observações</span>

                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    placeholder="Ex: tirar cebola, ponto da carne, troco..."
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none placeholder:text-white/30"
                  />
                </label>
              </div>

              {/* Rodapé fixo do carrinho com resumo financeiro e botão de envio. */}
              <div className="border-t border-white/10 p-5">
                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-white/70">
                    <span>Entrega</span>
                    <span>{cart.length ? formatCurrency(DELIVERY_FEE) : formatCurrency(0)}</span>
                  </div>

                  <div className="flex justify-between text-xl font-black">
                    <span>Total</span>
                    <span className="text-orange-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={finishOrder}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-4 font-black text-white shadow-lg shadow-green-500/20"
                >
                  <MessageCircle size={20} /> Finalizar no WhatsApp
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/40">
                  <CheckCircle2 size={14} /> Pedido revisado antes do envio
                </p>
              </div>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
