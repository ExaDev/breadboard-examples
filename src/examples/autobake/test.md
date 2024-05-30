

 # CSS paint-order for non-SVG text

Adds support for the existing CSS property `paint-order`. This change only affects html (non-SVG) text; SVG text already supports paint-order via attribute or CSS property.

## Summary

This feature adds support for using the `paint-order` CSS property on non-SVG text. The `paint-order` property controls the order that the fill, stroke, and marker of text are painted. This allows text to mimic the effect of SVG text, which already supports `paint-order`.

## Implementation Status

- **Blink Component:** Blink>Paint
- **Chromium Bug:** [41372165](https://crbug.com/41372165)
- **Implementation Status:** Enabled by default (Milestone 123)
- **Enterprise Impact:** Minor

## Consensus & Standardization 

- **Firefox:** Shipped/Shipping
- **Safari:** Shipped/Shipping  
- **Web Developers:** No signals

## Next Steps

- Review potential enterprise impact
- Complete security review
- Complete privacy review

## References

- [Intent to Implement](https://groups.google.com/a/chromium.org/d/msgid/blink-dev/CAHOQ7J9i%3DwoeX%2Bh%2B1rwpidM%3D5SiMPnCq9fskupy2tDUjXcMAMw%40mail.gmail.com)
- [Chromium Bug](https://crbug.com/41372165) (New bugs: [File a bug](https://bugs.chromium.org/p/chromium/issues/entry?components=Blink%3EPaint&cc=szager%40chromium.org))

---