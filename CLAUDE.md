# CLAUDE.md — Medix (Vue clone)

## Что это

Это **Vue-переписывание** приложения Medix — мессенджер-мини-аппа (Telegram / MAX)
для онлайн-записи в медицинскую клинику. Пользователь запускает WebApp внутри
мессенджера, авторизуется по данным мессенджера, смотрит текущую/прошлые записи и
записывается на приём (филиал → категория → услуга → врач → дата/время).

Мы клонируем **функциональность** оригинального React-приложения, но с **собственным
UI** (другой дизайн и бренд). Оригинал — референс логики и API, не дизайна.

- **Референс (React, source of truth по логике/API):** `/Users/harut/Downloads/medix-react-master`
  (в репо не входит, отдельная папка). Бренд оригинала — фиолетовый ортопедический
  центр. Наш бренд — зелёная стоматология («Клиника Доктора Дагбаева»).
- **Наш проект (target):** этот каталог `/Users/harut/Documents/projects/medix`.

> При расхождениях: **бизнес-логику и контракты API берём из React-оригинала**,
> **вёрстку/дизайн — из наших уже готовых Vue-вьюх**.

---

## Наш стек (Vue)

- **Vue 3** (`<script setup>` SFC) + **Vite 8**
- **vue-router 5** (`createWebHistory`), lazy-роуты
- **Tailwind CSS v4** через `@tailwindcss/vite` — конфиг токенов в `src/style.css`
  (директива `@theme`), **без** `tailwind.config.js`
- **reka-ui** — headless-компоненты (используется `Calendar*` в `ViewDatetime`)
- **embla-carousel-vue** — карусель активных записей (`ViewActive`)
- **@lucide/vue** — иконки
- **@internationalized/date** — `CalendarDate` для календаря
- Пакетный менеджер — **pnpm** (`pnpm-lock.yaml`)
- Алиас: `@` → `./src`

Команды: `pnpm dev`, `pnpm build`, `pnpm preview`, `pnpm format` (prettier).

### Стиль кода (prettier — `.prettierrc.json`)
Табы (ширина 4), без `;`, одинарные кавычки, `trailingComma: all`, printWidth 100.
Соблюдать при генерации `.vue`/`.js`.

### Дизайн-токены (`src/style.css`, `@theme`)
- Бренд: `--color-brand: #01b27d` (зелёный), `--color-brand-foreground: #fff`
- Поверхности: `--color-page #efefed`, `--color-card #fff`, `--color-card-darker #f5f5f5`
- Текст: `--color-gray #555559`, secondary-палитра
- Шрифты: `--font-amstelvar` (заголовки), `--font-open-sans` (body, default)
- Утилита `section-title`, `shadow-accent`, размеры `text-15` / `text-13`
- Переходы страниц (slide-left/right) — во `App.vue` + классы в `style.css`

---

## Структура нашего проекта

```
src/
  main.js                 # createApp + router + style.css
  App.vue                 # layout-обёртка + RouterView с анимацией перехода
  router/index.js         # плоский список роутов (см. ниже)
  style.css               # tailwind @theme, шрифты, анимации
  views/                  # экраны (см. таблицу соответствия)
  api/                    # http.js (axios+Bearer+apiErrorMessage), users, branches,
                          # coworkers, promos, appointments
  composables/            # useMessenger, useAuth, useBooking, useAppointments
  lib/                    # storage.js (localStorage), cache.js (кеш запросов на сессию)
  config.js               # API_BASE, COMPANY_ID, MEDIA_BASE, fileUrl
  components/
    ui/UiBtn.vue          # базовая кнопка (варианты color/soft/outline/icon/fluid, to→RouterLink)
    ui/UiLoader.vue       # общий индикатор загрузки
    ui/UiPageTitle.vue
    doctor/DoctorCard.vue
    history/HistoryCard.vue  # карточка записи (услуга / врач / дата + «Повторить»)
    legal/LegalDialog.vue    # шторка «Правовая информация» (reka-ui Dialog)
  assets/fonts/           # Amstelvar, Open Sans
public/                   # doctor-*.png, loading-*, favicon.svg, icons.svg
index.html                # подключает https://st.max.ru/js/max-web-app.js
```

### Текущий статус
**Готово:**
- **связь с мессенджером MAX** — `src/composables/useMessenger.js`, инициализация
  в `App.vue`;
- **загрузочный флоу + авторизация**: сплэш `ViewHome` (`/`) ищет клиента и
  разводит на `/profile` (нашли) или `/agree` (регистрация); `ViewAgree`
  → `requestPhone()` + `register`;
- **API-слой**: `src/config.js`, `src/api/http.js` (axios + Bearer + `apiErrorMessage`),
  `users`, `branches`, `coworkers`, `promos`, `appointments`. Dev-прокси `/api`
  на бэкенд в `vite.config.js`;
- **сквозной флоу записи**: филиал → услуга → врач → дата/время → `POST
  /appointment/create`. Выбор живёт в `src/composables/useBooking.js` (модульное
  состояние + `appointmentPayload()` + `isComplete()`), после успеха — `reset()`
  и переход на `/profile`;
- **записи клиента**: `src/composables/useAppointments.js` (загрузка + форматтеры),
  слайдер актуальных записей на `/profile`, список карточек на `/active`;
- **кеш справочников на сессию** — `src/lib/cache.js`: филиалы и врачи
  запрашиваются один раз, при возврате назад отдаются синхронно (без лоадера).
  Расписание и записи **не кешируем** — они меняются.

**Ещё НЕ сделано:**
- отмена и перенос записи (`/appointment/cancel`, `update`), кнопка «Повторить»
  в карточке записи — пока не подключены;
- имя/аватар клиента на экранах (сейчас заглушка «Иванов Иван»);
- категории/услуги как отдельные сущности (`ViewCategory` на моках);
- текст в `LegalDialog` — рыба (lorem ipsum), заменить на документы клиники.

> ⚠️ **API: по факту работаем по СТАРЫМ (React) путям.** Хост — `VITE_API_HOST`
> (сейчас `https://dental-web.pro`). Новый контракт из `Документация_API.md`
> (ресурсы во множественном числе, id в пути) живой сервер не отдаёт, поэтому в
> коде: `/branch/index`, `/coworker/index|view|get-schedule`, `/promo/index|view`,
> `/appointment/index|create`, `/user/by-phone`. Во множественном числе остались
> только `users/check-chat-id/{id}` и `users/register-telegram/{source}`.
> Новый контракт — цель на будущее, но не переписывать вслепую: сверяться с тем,
> что реально отвечает сервер (без токена всё отдаёт **401**).

### Слой мессенджера (MAX)
Один простой composable — `src/composables/useMessenger.js`. SDK `window.WebApp`
(скрипт `https://st.max.ru/js/max-web-app.js` уже в `index.html`) создаётся
**синхронно** и разбирает данные пользователя из URL ещё до старта Vue — поэтому
читаем их один раз, без поллинга/async/реактивности (за сессию не меняются).
- `initMessenger()` — вызывает `WebApp.ready()` (один раз в `App.vue`).
- `useMessenger()` → `{ user, isMax, initData, requestPhone() }`.

Факты по SDK: глобал `window.WebApp`; `ready()` сигналит хосту; метода `expand()`
**нет** (телеграмизм, не портируем); пользователь — `WebApp.initDataUnsafe.user`
= `{ id, first_name, last_name, username, language_code, photo_url }`; `WebApp.platform`
∈ `ios|android|desktop|web` (иначе `null` = вне MAX); телефон — `WebApp.requestContact()`.
Нужен API-слой: по `user.id` вызвать `check-chat-id`; если нет — показать согласия
(`ViewAgree`), запросить телефон `requestPhone()` и `register-telegram?source=max`.

### Локальная разработка под MAX
У MAX нет эмулятора/dev-режима (офиц. доки: dev.max.ru/docs/webapps). Два контура:
- **Браузер** (основное): `pnpm dev`, `isMax=false`. Вне MAX пользователя нет, поэтому
  в DEV `useMessenger` подставляет тестового `user` (id: 1) — для отладки авторизации/записи.
- **Реальный MAX**: нужен публичный HTTPS. Туннель (`cloudflared tunnel --url http://localhost:5173`
  или `ngrok`), URL зарегистрировать в `business.max.ru/self` (Чат-боты → Расширенные
  настройки), открыть через `https://max.ru/<bot>?startapp=`. В `vite.config.js` для этого
  включены `server.host` и `server.allowedHosts`.

Официальные доки: `dev.max.ru/docs/webapps/{introduction,bridge,validation}`.

### Деплой (GitHub Pages)
`.github/workflows/deploy.yml` на каждый пуш в `main` собирает проект и публикует
`dist` на Pages (источник в настройках репозитория — **GitHub Actions**).
Две переменные сборки, обе задаёт workflow:
- `VITE_BASE=/<repo>/` — на Pages приложение живёт в подпапке, из этой базы Vite
  строит пути к ассетам, а роутер берёт `import.meta.env.BASE_URL`;
- `VITE_API_BASE=https://dental-web.pro/api` — на статике dev-прокси нет, поэтому
  запросы идут на бэкенд напрямую и упираются в его CORS.

Ещё workflow копирует `index.html` в `404.html`: Pages для неизвестного пути
отдаёт `404.html`, и без этого прямой заход на `/profile` ломался бы.

Роуты сейчас **плоские** (`/booking`, `/branch`, `/service`, `/category`,
`/doctors`, `/datetime` и т.д.) — в оригинале это был единый экран `create` с
модалкой и панелями. Мы разбили flow на отдельные экраны — это осознанно, наш UX.

### Соответствие экранов (наш ↔ оригинал)
| Наш роут / View            | Оригинал (React)                    | Назначение                         |
|----------------------------|-------------------------------------|------------------------------------|
| `ViewHome` `/`             | `pages/welcome`                     | сплэш/загрузка                     |
| `ViewAgree` `/agree`       | `pages/welcome` (Popup+Checkbox)    | согласия ПДн перед регистрацией    |
| `ViewProfile` `/profile`   | `pages/home/route` + `VisitCard`    | **главный экран**: слайдер записей, плитки, правовая информация, таббар |
| `ViewActive` `/active`     | `pages/history` + `VisitCard`       | список текущих записей карточками  |
| `ViewSale` `/sale`         | `pages/home/promo`                  | акции                              |
| `ViewService` `/service`   | `pages/home/services` / `SelectList`| список услуг                       |
| `ViewCategory` `/category` | `create` (панель category)          | выбор категории (на моках)         |
| `ViewDoctors` `/doctors`   | (нет — новое)                       | выбор врача                        |
| `ViewBranch` `/branch`     | `create` (branch)                   | выбор филиала                      |
| `ViewDatetime` `/datetime` | `create` (Calendar+TimeSlotGroup)   | выбор даты/времени + создание записи |

Главный экран — **`/profile`**: туда ведут сплэш, регистрация, возврат из акций
и переход после успешного создания записи. Отдельного экрана истории нет
(`/history` удалён) — все текущие записи показываются на `/profile` (слайдер)
и на `/active` (список карточек `HistoryCard`).

---

## Референс: оригинальное React-приложение

Стек оригинала: React 19 + react-router 7 (data router, `createBrowserRouter`) +
**styled-components** + axios + FontAwesome. Vite. TypeScript. Двойная сборка: dev на
`/`, prod под базой `/max/app-1/`. Локальный dev по HTTPS на `medix.local:444` с
proxy `/api`,`/images`,`/base` на `https://medix.amgs.online`.

### Backend / API — АКТУАЛЬНЫЙ контракт (`Документация_API.md`)

> ⚠️ Это **источник правды по API** и он **приоритетнее React-оригинала**.
> Новый контракт заметно отличается от путей в React-коде: ресурсы во
> множественном числе, id — в **пути** (не query-фильтром), запись создаётся
> **JSON** (а не FormData), отмена — `POST` (а не `GET`). Пути из React-классов
> (`/user/...`, `/company/view?id=`, FormData) считать **устаревшими**.

- База: `https://medix.amgs.online`, `apiUrl = <base>/api`. JSON. Картинки приходят
  путями `/uploads/...` → префиксовать базой.
- `company_id` — из `import.meta.env.VITE_COMPANY_ID`.
- Авторизация: **Bearer-токен** в `localStorage` (кроме `appointments/create` —
  он без авторизации). Токен получаем из `access_token` при register/check-chat-id.

Эндпоинты:
- **Записи** (`AppointmentController`):
  - `GET /appointments/index?filter[client_id]=…&expand=client,services,branch,company`
  - `GET /appointments/view/{id}`
  - `POST /appointments/create` — **без авторизации**, JSON:
    `{ client_id, company_id, branch_id, date:"YYYY-MM-DD", start:"HH:mm", services:[id], comment, source:"max" }`.
    Ошибки валидации → `{ поле: ["сообщение"] }`.
  - `GET /appointments/last?client_id=…` — активная запись (исключает `5 complete`, `6 cancel`).
  - `PUT /appointments/update/{id}` — `{ date, start, comment }`
  - `POST /appointments/cancel/{id}` — ставит статус `6`; `DELETE /appointments/delete/{id}`.
- **Категории** (`CategoryController`):
  - `GET /categories/index?filter[company_id]=…&pageSize=100` — дерево (`children`, `services`, `schedules`).
  - `GET /categories/view/{id}`
  - `GET /categories/timeslots/{id}/{date}` — `date=YYYY-MM-DD` → `[{ start, end, available }]`
    (**слоты теперь считает сервер** — на клиенте из `schedules` строить не нужно).
- **Услуги** (`ServiceController`): `GET /services/index?filter[category_id]=…`, `GET /services/view/{id}` (с `schedules`).
- **Компании** (`CompanyController`): `GET /companies/index` (с `default_category_id`, `branches`), `GET /companies/view/{id}`.
- **Промо** (`PromoController`): `GET /promos/index`, `GET /promos/view/{id}`.
- **Пользователи** (`UserController`):
  - `GET /users/check-chat-id/{chat_id}` → клиент + `access_token`, либо `null`.
  - `POST /users/register-telegram/{source}` (`source` = `telegram|max`), body
    `{ id, phone, first_name, last_name, username, avatar }` → клиент + `access_token`.
  - `GET /users/by-phone/{phone}` — поиск клиента по телефону.

Статусы записи: `0` лист ожидания, `1` отправлен, `2` SMS, `4` подтверждён,
`5` выполнен, `6` отменён. Активные (для `last`/списка) — `0,1,2,4`.
CORS: `GET/POST/PUT/DELETE/OPTIONS`, credentials `true`.

### Модели (оригинал, `app/classes/*.ts`)
OOP-классы с геттерами/сеттерами и статическими методами-запросами:
`Account`, `Appointment`, `Category`, `Service`, `Company`, `Branch`, `Client`, `Promo`.
Примечания:
- `Appointment` при наличии `timestamp` считает дату как `(timestamp - 8ч) * 1000`
  (смещение таймзоны зашито).
- `Category` содержит `schedules` по дню недели — но в **новом API** тайм-слоты
  отдаёт сервер (`categories/timeslots/{id}/{date}`), клиентскую генерацию из
  React не портируем.
- Статусы записи (`status`): `0` — новая/создаётся, активные — `[0,1,2,4]`.
При портировании на Vue разумно заменить классы на composables/сервисы + plain-объекты.

### Интеграция с мессенджером (важно для портирования)
Оригинал работает и в **Telegram**, и в **MAX**. Есть единый абстрактный слой:
- `index.html` содержит `window.MessengerBridge` — определяет окружение (URL-параметр
  `platform`, userAgent, наличие `window.Max`/`window.Telegram`), инициализирует
  WebApp, кладёт данные в `window.__MESSENGER_DATA__` и вызывает колбэки /
  `CustomEvent('<type>:ready' | 'messenger:ready')`.
- `hooks/MessengerContext.tsx` — React-провайдер: нормализует пользователя, оборачивает
  WebApp, реализует `checkUserExists`, `register`, `requestPhoneNumber`.
  (`TelegramContext`/`MaxContext` — более старые отдельные реализации.)
- MAX-скрипт: `https://st.max.ru/js/max-web-app.js` (уже подключён в **нашем** `index.html`).
- Регистрация: запрос контакта (`requestContact` → `phone`) + флаги согласий
  (`privacy`,`policy`) → `POST register-telegram`.

Флоу авторизации (welcome): есть токен → `/home`; иначе, если есть данные мессенджера —
`checkUserExists`; нет пользователя → показать попап согласий и регистрацию.

### Логика записи (оригинал `pages/create/route.tsx`)
Один экран с модалкой и панелями `category → service → calendar`. Кнопки
«Далее/Сохранить/Назад» переключают панель. На «Сохранить» → `Appointment.create(...)`
c `source: "max"`, `branch_id: 1`, датой `YYYY-MM-DD` и `start` из выбранного слота,
затем Alert «Запись успешно создана» и возврат на `/home`. Повтор записи из истории
кладёт `selected_category`/`selected_service` в `localStorage` и открывает `create`.

---

## Принятые решения и грабли (наш код)

- **Время записи.** Слоты не берём из `get-schedule` как есть: из ответа читаем
  только **границы дня** (первый и последний слот) и строим **статичную сетку с
  шагом в час**; неполный час на краях отбрасываем (`09:30` → с `10:00`).
  Часы раньше «сейчас + 1 час» видны, но `disabled` (граница пересчитывается раз
  в минуту). Свободность конкретного часа проверяет бэкенд при создании записи.
- **`end` в теле записи** — `start + 30 минут` (константа `APPOINTMENT_MINUTES`
  в `useBooking`), как в примере запроса от бэка. Сетка при этом часовая —
  вопрос к бэку открыт; если длительность придёт в услуге, считать от неё.
- **`Status` в теле `appointment/create` — с большой буквы**, так поле называется
  в API. Не «исправлять».
- **Кеш только для справочников.** `lib/cache.js` кеширует промис и результат по
  ключу; экраны берут готовые данные синхронно (`loadedBranches()`,
  `loadedCoworkers()`) — поэтому при возврате назад нет ни запроса, ни лоадера.
  Ошибку не кешируем. Записи и расписание всегда запрашиваем заново.
- **Embla инициализируется один раз в `onMounted`** и только если контейнер уже
  в DOM. Поэтому слайдер на `/profile` держим в DOM всегда (`v-show`, не `v-if`),
  а после загрузки данных зовём `emblaApi.reInit()`. Иначе стрелки мёртвые.
- **Слайдер не зациклен**: на краях гасим стрелку по `canScrollPrev/Next`
  (события `select` и `reInit`).
- **Prettier.** Часть старых `.vue` ещё не отформатирована (точки с запятой,
  4 пробела). Форматируем **только те файлы, которые правим** — `pnpm format`
  на весь репозиторий создаёт шум в диффе. Для точечного прогона:
  `npx prettier --write <файлы>`.

---

## Рабочие принципы для этого репозитория
- Дизайн/вёрстку не «подгоняем под React» — наш UI первичен; переиспользуем
  `UiBtn` и токены из `style.css`, держим единый визуальный язык (зелёный бренд,
  скруглённые карточки `rounded-4xl`, `shadow-accent`, таббар снизу).
- **Контракты API берём из `Документация_API.md`** (актуально), а не из React-путей.
  Из React берём только бизнес-логику флоу (последовательность экранов, что за чем).
- При добавлении API-слоя: держать `company_id` и base-URL в одном месте (env +
  модуль-конфиг), токен — как в оригинале, но абстрагировать под мессенджер-агностик.
- Соблюдать prettier-настройки (табы, без `;`, одинарные кавычки).
- **Заголовки коммитов — всегда на английском**, в стиле Conventional Commits
  (`feat(datetime): ...`, `fix(api): ...`, `docs(changelog): ...`). Тело коммита
  можно писать по-русски.
- **`CHANGELOG.md` ведём по стандарту [Keep a Changelog 1.0.0](https://keepachangelog.com/en/1.0.0/)**
  и SemVer: заголовок версии `## [x.y.z] - YYYY-MM-DD`, английские названия секций
  (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`) — своих секций
  не выдумываем; текст записей на русском. Незарелиженное — в `## [Unreleased]`.
  Версию в `package.json` держим синхронной с последней записью.
