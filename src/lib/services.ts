// Quote form "Service needed" options (src/data/services.json, from design/component-quote-form, update 8).
// /api/lead accepts only these values (plus older names, so a page cached before an update still gets through).
import data from '../data/services.json';

const { _last, ...optionGroups } = data.quoteFormOptions;
/** Quote form <optgroup>s in order, then the final standalone option. */
export const quoteOptionGroups = Object.entries(optionGroups) as [string, string[]][];
export const quoteLastOption = _last;
/** Every valid value of the form's `service` field (validated server-side). */
export const quoteServiceValues = [...quoteOptionGroups.flatMap(([, opts]) => opts), _last];
