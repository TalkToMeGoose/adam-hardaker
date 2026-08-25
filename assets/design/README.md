# Homepage illustration assets

Production assets:

- `about-cutout.png` — preserve the supplied illustration and crop it responsively in CSS.
- `uh60-mask.png` — use as a CSS mask so its color and tilt remain controllable without damaging transparency.
- `hercules-source.png` — preserve the supplied pixel art; mute it slightly with CSS so it sits comfortably on the cream background.
- `research-logit.svg` — code-native research mark using binary observations and an S-shaped fitted logit curve.
- `topography.svg` — seamless contour field generated from periodic mathematical functions by `scripts/generate-topography.mjs`.

Reference palette:

- Navy: `#1F568F`
- Orange: `#F3A13A`
- Cream: `#F7E5C8`
- Warm khaki: `#A98A60`

Suggested homepage treatments:

```css
.quadrant-about__art {
  object-fit: contain;
  object-position: center bottom;
  transform: scale(1.08) translateY(3%);
}

.quadrant-cv__art {
  background: #a98a60;
  -webkit-mask: url("uh60-mask.png") center / contain no-repeat;
  mask: url("uh60-mask.png") center / contain no-repeat;
  opacity: 0.82;
  transform: rotate(-6deg);
}

.quadrant-side-quests__art {
  filter: saturate(0.72) sepia(0.08) contrast(0.96);
  opacity: 0.84;
}
```

The files under `drafts/` are palette studies only. They have baked preview backgrounds and should not be used in the site.
