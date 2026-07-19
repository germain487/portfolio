/**
 * Logique complète du panneau de Louise — importé dynamiquement à la
 * première ouverture (voir initChatWidget dans motion.ts), jamais dans le
 * bundle initial de la page. Rendu des messages en texte brut (textContent)
 * uniquement : la réponse du modèle n'est jamais injectée en HTML.
 */

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

const ENDPOINT = '/.netlify/functions/chat';
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 8;

export function mountChatWidget(root: HTMLElement) {
  const panel = root.querySelector<HTMLElement>('[data-chat-panel]')!;
  const toggle = root.querySelector<HTMLElement>('[data-chat-toggle]')!;
  const closeBtn = root.querySelector<HTMLElement>('[data-chat-close]')!;
  const messagesEl = root.querySelector<HTMLElement>('[data-chat-messages]')!;
  const suggestionsEl = root.querySelector<HTMLElement>('[data-chat-suggestions]')!;
  const form = root.querySelector<HTMLFormElement>('[data-chat-form]')!;
  const input = root.querySelector<HTMLInputElement>('[data-chat-input]')!;
  const sendBtn = root.querySelector<HTMLButtonElement>('[data-chat-send]')!;
  const iconOpen = root.querySelector<HTMLElement>('[data-chat-icon-open]')!;
  const iconClose = root.querySelector<HTMLElement>('[data-chat-icon-close]')!;

  const greeting = root.dataset.chatGreeting ?? '';
  const offlineMessage =
    root.dataset.chatOffline ??
    "Louise est indisponible pour le moment. Écrivez directement à Germain sur WhatsApp ou via la page Contact.";

  const history: Message[] = [];
  let isOpen = false;
  let hasGreeted = false;
  let isSending = false;
  let typingEl: HTMLElement | null = null;

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessage(role: Role, content: string) {
    const bubble = document.createElement('div');
    bubble.className =
      role === 'user'
        ? 'ml-auto max-w-[85%] rounded-card rounded-br-sm bg-accent/15 px-4 py-2.5 text-sm text-text'
        : 'mr-auto max-w-[85%] rounded-card rounded-bl-sm border border-surface-2 bg-bg px-4 py-2.5 text-sm text-text';
    bubble.textContent = content;
    messagesEl.appendChild(bubble);
    scrollToBottom();
  }

  function showTyping() {
    typingEl = document.createElement('div');
    typingEl.className =
      'mr-auto flex max-w-[85%] items-center gap-1 rounded-card rounded-bl-sm border border-surface-2 bg-bg px-4 py-3';
    typingEl.setAttribute('aria-label', 'Louise écrit…');
    typingEl.innerHTML =
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-text-muted"></span>';
    messagesEl.appendChild(typingEl);
    scrollToBottom();
  }

  function hideTyping() {
    typingEl?.remove();
    typingEl = null;
  }

  async function sendMessage(raw: string) {
    const text = raw.trim().slice(0, MAX_MESSAGE_LENGTH);
    if (!text || isSending) return;

    suggestionsEl.hidden = true;
    isSending = true;
    sendBtn.disabled = true;
    input.disabled = true;

    appendMessage('user', text);
    history.push({ role: 'user', content: text });
    input.value = '';
    showTyping();

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history.slice(-MAX_HISTORY_MESSAGES) }),
      });
      if (!res.ok) throw new Error(`chat: ${res.status}`);
      const data = (await res.json()) as { reply?: string };
      const reply = data.reply?.trim() || offlineMessage;
      hideTyping();
      appendMessage('assistant', reply);
      history.push({ role: 'assistant', content: reply });
    } catch {
      hideTyping();
      appendMessage('assistant', offlineMessage);
    } finally {
      isSending = false;
      sendBtn.disabled = false;
      input.disabled = false;
      input.focus();
    }
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  function open() {
    isOpen = true;
    panel.hidden = false;
    requestAnimationFrame(() => panel.classList.add('is-open'));
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fermer l’assistante Louise');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');

    if (!hasGreeted && greeting) {
      hasGreeted = true;
      appendMessage('assistant', greeting);
    }

    document.addEventListener('keydown', onKeydown);
    window.setTimeout(() => input.focus(), 50);
  }

  function close() {
    isOpen = false;
    panel.classList.remove('is-open');
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', "Ouvrir l'assistante Louise");
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    document.removeEventListener('keydown', onKeydown);
    toggle.focus();
  }

  function toggleFn() {
    isOpen ? close() : open();
  }

  closeBtn.addEventListener('click', close);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage(input.value);
  });
  suggestionsEl.querySelectorAll<HTMLButtonElement>('[data-chat-suggestion]').forEach((btn) => {
    btn.addEventListener('click', () => sendMessage(btn.textContent ?? ''));
  });

  return { toggle: toggleFn, open, close };
}
