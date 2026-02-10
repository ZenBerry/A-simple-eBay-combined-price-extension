(() => {
  const CONTAINER_SELECTOR = '.su-card-container__attributes__primary';
  const PRICE_SELECTOR = '.s-card__price';
  const TOTAL_CLASS = 'combined-total-price';
  const CONTAINER_RESTYLE_ATTR = 'data-combined-container-restyled';

  const parseMoney = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/,/g, '');
    const match = cleaned.match(/([\$\u00a3\u20ac])?\s*([0-9]+(?:\.[0-9]+)?)/);
    if (!match) return null;
    return {
      currency: match[1] || '$',
      value: Number(match[2])
    };
  };

  const findShipping = (container) => {
    const rows = Array.from(container.querySelectorAll('.s-card__attribute-row .su-styled-text'));
    for (const row of rows) {
      const text = row.textContent || '';
      if (!/delivery|shipping/i.test(text)) continue;
      const money = parseMoney(text);
      if (money) return { money, el: row };
    }
    return null;
  };

  const formatMoney = (currency, value) => {
    return `${currency}${value.toFixed(2)}`;
  };

  const addCombinedTotal = (container) => {
    if (container.querySelector(`.${TOTAL_CLASS}`)) return;

    const priceEl = container.querySelector(PRICE_SELECTOR);
    if (!priceEl) return;

    const price = parseMoney(priceEl.textContent || '');
    if (!price) return;

    const shippingInfo = findShipping(container);
    const shipping = shippingInfo?.money;
    const shippingValue = shipping ? shipping.value : 0;
    const currency = shipping?.currency || price.currency;

    const total = price.value + shippingValue;

    const totalEl = document.createElement('span');
    totalEl.className = TOTAL_CLASS;
    totalEl.textContent = formatMoney(currency, total);
    totalEl.style.display = 'block';
    totalEl.style.color = '#1a9c2d';
    totalEl.style.fontWeight = '700';
    totalEl.style.fontSize = '2em';
    totalEl.style.lineHeight = '1';
    totalEl.style.marginBottom = '2px';

    priceEl.parentElement.insertBefore(totalEl, priceEl);

    let baseStyle = null;
    if (shippingInfo?.el) {
      baseStyle = getComputedStyle(shippingInfo.el);
    }

    if (!container.hasAttribute(CONTAINER_RESTYLE_ATTR)) {
      if (baseStyle) {
        container.style.color = baseStyle.color;
        container.style.fontWeight = baseStyle.fontWeight;
        container.style.fontSize = baseStyle.fontSize;
        container.style.lineHeight = baseStyle.lineHeight;
      } else {
        container.style.color = '#6b6b6b';
        container.style.fontWeight = '400';
        container.style.fontSize = '0.95em';
        container.style.lineHeight = '1.2';
      }
      container.setAttribute(CONTAINER_RESTYLE_ATTR, 'true');
    }

    const priceColor = baseStyle?.color || '#6b6b6b';
    const priceWeight = baseStyle?.fontWeight || '400';
    const priceSize = baseStyle?.fontSize || '0.95em';
    const priceLine = baseStyle?.lineHeight || '1.2';

    priceEl.style.setProperty('color', priceColor, 'important');
    priceEl.style.setProperty('font-weight', priceWeight, 'important');
    priceEl.style.setProperty('font-size', priceSize, 'important');
    priceEl.style.setProperty('line-height', priceLine, 'important');
  };

  const processAll = () => {
    const containers = document.querySelectorAll(CONTAINER_SELECTOR);
    containers.forEach(addCombinedTotal);
  };

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      processAll();
    }, 100);
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.documentElement, { childList: true, subtree: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processAll, { once: true });
  } else {
    processAll();
  }
})();
