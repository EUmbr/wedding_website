# Site content

All copy is lowercase by design (except where shown otherwise). Reproduce it exactly as
written here — do not capitalize, do not rephrase, do not add punctuation.

## Bold text map (owner, 2026-07-13)

Everything uses Helvetica CY; the following is set in **bold**, the rest in regular:

- Section 1: `все начинается с точки`, `08.08.2026`, the `v` in the scroll-down circle
- Section 2: `содержание`
- Section 3: `тайминг` + all time labels (15:00 etc.)
- Section 4: `локация`, `Культ.Гараж`, the address, `открыть карту`
- Section 5: `детали торжества`, `подарки`, `цветы`, `контакты`, `Марии`
- Section 6: `dress-code`, `black`
- Section 7: everything **except** the answer options
- Section 8: everything

Layout note for section 1 (owner): elements stack directly on top of each other — no gaps,
no overlaps; only the three headline lines intersect slightly. The top circle touches the
screen's top edge fully visible.

---

## Splash screen — `references/opening_slide.png`

- Instruction: `нажмите на mp3, чтобы открыть приглашение`
- File label: `2026_свадьба симы и жени.mp3`

---

## Section 1 — Title — `references/slide1.png`

- `все начинается с точки`
- `cима и женя`
- `08.08.2026`

---

## Section 2 — Table of contents — `references/slide2.png`

Heading: `содержание`

Anchor links, in order:

| Label | Target |
|---|---|
| `тайминг` | Section 3 |
| `локация` | Section 4 |
| `детали` | Section 5 |
| `dress-code` | Section 6 |
| `бриф гостя` | Section 7 |

---

## Section 3 — Timeline — `references/slide3.png`

Heading: `тайминг`

| Time | Event |
|---|---|
| 15:00 | `сбор гостей` |
| 16:00 | `начало церемонии` |
| 17:00 | `банкет` |
| 20:00 | `первый танец` |
| 20:45 | `букет и бутоньерка` |
| 23:00 | `завершение` |

> **Note (owner ruling, 2026-07-13):** the reference `slide3.png` shows `22:00 завершение` —
> that is outdated. `23:00` above is correct.

---

## Section 4 — Location — `references/slide4.png`

Heading: `локация`

Body:
- `наш праздник пройдет на площадке Культ.Гараж`
- `она находится по адресу: г. Москва, ул. Ивана Франко, вл 2`

Button label: `открыть карту`
Button link: `https://yandex.ru/maps/-/CTBXr68b`

### Map embed

Venue: Культ.Гараж (Yandex organization id `23020825901`)
Coordinates: `55.729070, 37.457747` (lat, lon)

**The embed below is the raw copy-paste from Yandex Maps and must NOT be used as-is.**
Problems: it opens the business info card (which covers the map), the zoom is wrong, and the
size is hardcoded to 560×400. Rebuild the `map-widget` URL keeping only coordinates, a point
marker (`pt` parameter), and an appropriate zoom. Make it responsive.

Raw reference embed:

```html
<div style="position:relative;overflow:hidden;"><a href="https://yandex.ru/maps/org/kult_garazh/23020825901/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:0px;">Культ. Гараж</a><a href="https://yandex.ru/maps/213/moscow/category/photo_studio/84843009243/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:14px;">Фотостудия в Москве</a><a href="https://yandex.ru/maps/213/moscow/category/rental_of_venues_for_cultural_events/15215599314/?utm_medium=mapframe&utm_source=maps" style="color:#eee;font-size:12px;position:absolute;top:28px;">Аренда площадок для культурно-массовых мероприятий в Москве</a><iframe src="https://yandex.ru/map-widget/v1/?ll=37.457747%2C55.729070&mode=search&oid=23020825901&ol=biz&sctx=ZAAAAAgBEAAaKAoSCWdl%2B5C3%2BktAEVJgAUwZXktAEhIJhBJm2v6V3j8RDvYmhuRkxD8iBgABAgMEBSgKOABAj5IHSAFiY3JlYXJyPXNjaGVtZV9Mb2NhbC9HZW8vQWR2ZXJ0cy9SZWFycmFuZ2VCeUF1Y3Rpb24vU2ltaWxhck9yZ3NMaXN0QXVjdGlvbi9FbmFibGVGaWx0cmF0aW9uQnlXaW5kb3c9MWoCcnWdAc3MzD2gAQCoAQC9AXz%2BMX3CAQWt2pfhVYICFdC60YPQu9GM0YIu0LPQsNGA0LDQtooCAJICAJoCDGRlc2t0b3AtbWFwc6oCIDIyMDYzMDg3NDQyMSw2MDAyMjQ0LDU1MjY1MzkyNzIxsAIB&sll=37.458777%2C55.729070&sspn=0.004565%2C0.001484&text=%D0%BA%D1%83%D0%BB%D1%8C%D1%82.%D0%B3%D0%B0%D1%80%D0%B0%D0%B6&z=16" width="560" height="400" frameborder="1" allowfullscreen="true" style="position:relative;"></iframe></div>
```

---

## Section 5 — Details — `references/slide5.png`

Heading: `детали торжества`

**подарки**
`предлагаем Вам не обременять себя поиском подарка, а предоставить это замечательное право нам, внеся свой вклад в бюджет нашей семьи`

**цветы**
`мы будем благодарны, если вы поддержите нашу просьбу и не будете дарить цветы`

**контакты**
`по всем вопросам Вы можете обращаться к нашему свадебному организатору Марии`

Contact link — **placeholder, to be replaced before launch**:

- href: `#` (temporary)
- Mark it clearly in the code with a `TODO: replace placeholder organizer contact link`
  comment so it's easy to find later.

---

## Section 6 — Dress code — `references/slide6.png`

Heading: `dress-code`

- `нам будет особенно приятно, если вы поддержите атмосферу вечера и придёте в образах черного цвета`
- `black`

---

## Section 7 — Guest brief (RSVP) — `references/slide7.png`

Heading: `бриф гостя`
Subheading: `Будем ждать ваш ответ до 18.07.2026`

> **Note (owner ruling, 2026-07-13):** the deadline was moved from `16.07.2026` (still shown
> in the reference `slide7.png`) to `18.07.2026`.

### Google Form

Form URL: `https://forms.gle/5BB2Cg6aJTLYvFVr8`

| Field | Entry ID | Type |
|---|---|---|
| `фио` | `entry.1199485873` | text |
| `присутствие` | `entry.100062412` | radio |
| `предпочтения по напиткам` | `entry.1865058381` | checkbox (multi-select) |
| `предпочтения по горячему блюду` | `entry.1134375954` | radio |

> **Note (owner ruling, 2026-07-13):** the drinks field is a Google Forms **checkbox**
> question — guests may pick several drinks. The site must allow multiple selection and
> submit one `entry.1865058381` value per checked option. The other two choice fields are
> single-select radio.

Submitted values must match the option labels below **exactly**, lowercase.

### Fields and options

**`фио`** — free text input

**`присутствие`**
- `нет`
- `да`

**`предпочтения по напиткам`** — multiple selection allowed
- `пиво`
- `шампанское` *(owner confirmed: the reference `slide7.png` shows a typo `шампанскиое`; the
  correct value — displayed and submitted — is `шампанское`)*
- `белое вино`
- `красное вино`
- `безалкогольные напитки`
- `водка`

**`предпочтения по горячему блюду`**
- `рыба`
- `курица`

---

## Section 8 — Closing — `references/slide8.png`

- `с любовью, Сима и Женя!`
- Interactive connect-the-dots heart — see `files/slide8/heart_game.png`
- Countdown timer to `2026-08-08T15:00:00+03:00`

The timer's visual design (layout, unit labels, digit styling) is defined by the reference
image — follow it exactly. Once the deadline passes, the timer just shows zeros.