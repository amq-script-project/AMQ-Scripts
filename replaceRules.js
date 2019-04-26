function replaceRule(match, replace) {
  let newRules = [];
  Array.from(document.styleSheets).forEach(s => {
      Array.from(s.rules).map((rule, idx) => ({rule, idx})).reverse().forEach(r => {
          if (r.rule.cssText.includes(match)) {
              newRules.push(r.rule.cssText.split(match).join(replace));
              s.deleteRule(r.idx)
          }
      })
  });
  newRules.forEach(r => document.styleSheets[0].insertRule(r))
}

replaceRule("rgb(66, 66, 66)", "rgb(27, 27, 27)")