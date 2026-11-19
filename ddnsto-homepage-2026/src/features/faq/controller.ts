const normalize = (text: string) =>
  text.normalize('NFKC').trim().toLocaleLowerCase();
export class FaqBrowser extends HTMLElement {
  private group = '开始前想知道';
  private limit = 6;
  private entries: { node: HTMLDetailsElement; group: string; text: string }[] =
    [];
  private abort?: AbortController;
  private get search() {
    return this.querySelector<HTMLInputElement>('#faq-search')!;
  }
  connectedCallback() {
    this.abort?.abort();
    this.abort = new AbortController();
    const { signal } = this.abort;
    this.entries = [
      ...this.querySelectorAll<HTMLDetailsElement>('[data-faq-item]'),
    ].map((node) => ({
      node,
      group: node.dataset.group!,
      text: normalize(node.textContent ?? ''),
    }));
    this.addEventListener(
      'input',
      () => {
        this.limit = 6;
        this.render(true);
      },
      { signal },
    );
    this.addEventListener('click', this.onClick, { signal });
    this.addEventListener('toggle', this.onToggle, { signal, capture: true });
    document.addEventListener('click', this.onCategoryLink, { signal });
    this.render(true);
  }
  disconnectedCallback() {
    this.abort?.abort();
  }
  private render(reset: boolean) {
    const query = normalize(this.search.value);
    const matches = this.entries.filter((f) =>
      query ? f.text.includes(query) : f.group === this.group,
    );
    const visible = new Set(matches.slice(0, this.limit).map((f) => f.node));
    this.entries.forEach(({ node }) => {
      node.hidden = !visible.has(node);
      if (reset || node.hidden) node.open = false;
    });
    this.querySelectorAll<HTMLElement>('[data-faq-group]').forEach((button) =>
      button.setAttribute(
        'aria-pressed',
        String(!query && button.dataset.faqGroup === this.group),
      ),
    );
    this.querySelector('#faq-count')!.textContent = query
      ? `搜索全部 ${this.entries.length} 个问题 · 找到 ${matches.length} 项，已显示 ${visible.size} 项`
      : `${this.group} · ${matches.length} 个问题${matches.length > visible.size ? `，已显示 ${visible.size} 个` : ''}`;
    this.querySelector<HTMLElement>('#faq-empty')!.hidden =
      matches.length !== 0;
    const more = this.querySelector<HTMLButtonElement>('[data-faq-more]')!;
    more.hidden = matches.length <= 6;
    more.textContent =
      visible.size < matches.length
        ? `查看更多（还有 ${matches.length - visible.size} 个）`
        : '收起更多问题';
    more.dataset.expanded = String(visible.size === matches.length);
  }
  private onClick = (event: MouseEvent) => {
    const button = (event.target as Element).closest<HTMLElement>('button');
    if (!button) return;
    if (button.dataset.faqGroup) {
      this.group = button.dataset.faqGroup;
      this.search.value = '';
      this.limit = 6;
      this.render(true);
    } else if (button.hasAttribute('data-faq-clear')) {
      this.search.value = '';
      this.limit = 6;
      this.render(true);
      this.search.focus();
    } else if (button.hasAttribute('data-faq-more')) {
      this.limit = button.dataset.expanded === 'true' ? 6 : this.limit + 6;
      this.render(false);
    }
  };
  private onToggle = (event: Event) => {
    const target = event.target;
    if (!(target instanceof HTMLDetailsElement) || !target.open) return;
    this.entries.forEach(({ node }) => {
      if (node !== target) node.open = false;
    });
  };
  private onCategoryLink = (event: MouseEvent) => {
    const link = (event.target as Element).closest<HTMLElement>(
      '[data-faq-target]',
    );
    if (!link) return;
    const group = link.dataset.faqTarget;
    if (!this.entries.some((f) => f.group === group)) return;
    this.group = group!;
    this.search.value = '';
    this.limit = 6;
    this.render(true);
  };
}
