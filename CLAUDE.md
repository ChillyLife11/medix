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
  components/
    ui/UiBtn.vue          # базовая кнопка (варианты color/soft/outline/icon/fluid, to→RouterLink)
    doctor/DoctorCard.vue
    history/HistoryCard.vue
  assets/fonts/           # Amstelvar, Open Sans
public/                   # doctor-*.png, loading-*, favicon.svg, icons.svg
index.html                # подключает https://st.max.ru/js/max-web-app.js
```

### Текущий статус
**Готово:**
- статическая вёрстка почти всех экранов на моковых данных;
- **связь с мессенджером MAX** — `src/composables/useMessenger.js`, инициализация
  в `App.vue`;
- **загрузочный флоу + авторизация**: сплэш `ViewHome` (`/`) ждёт `checkAuth` и
  разводит на `/active` (есть токен/клиент) или `/agree` (регистрация); `ViewAgree`
  → `requestPhone()` + `register`;
- **зачаток API-слоя**: `src/config.js`, `src/api/http.js` (fetch+Bearer),
  `src/api/users.js`, `src/composables/useAuth.js`. Dev-прокси `/api`,`/uploads`
  на бэкенд в `vite.config.js`.

**Ещё НЕ сделано (портировать из React):**
- остальные API-вызовы (company/category/service/appointment/promo) и экраны на них;
- реальное состояние flow записи (сейчас каждый экран изолирован, локальный `ref`);
- оверлей-лоадер поверх экранов на время fetch (в React — общий `Loader`).

> ⚠️ **API-контракт: целимся на НОВЫЙ (`Документация_API.md`), но живой сервер
> `medix.amgs.online` его ещё НЕ отдаёт** — новые пути возвращают **500**, живы пока
> старые (React) пути. Это решение (целимся в новый) принято осознанно; сквозной
> флоу заработает после обновления бэкенда. Сейчас в dev сплэш из-за 500 корректно
> уводит на `/agree` (ошибка ловится в `useAuth.checkAuth`). Проверено curl'ом:
> `GET /api/users/check-chat-id/{id}` → 500, `GET /api/user/check-chat-id?chat_id=` → 200.

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

Роуты сейчас **плоские** (`/booking`, `/branch`, `/service`, `/category`,
`/doctors`, `/datetime` и т.д.) — в оригинале это был единый экран `create` с
модалкой и панелями. Мы разбили flow на отдельные экраны — это осознанно, наш UX.

### Соответствие экранов (наш ↔ оригинал)
| Наш роут / View            | Оригинал (React)                    | Назначение                         |
|----------------------------|-------------------------------------|------------------------------------|
| `ViewHome` `/`             | `pages/welcome`                     | сплэш/загрузка                     |
| `ViewAgree` `/agree`       | `pages/welcome` (Popup+Checkbox)    | согласия ПДн перед регистрацией    |
| `ViewActive` `/active`     | `pages/home/route` + `VisitCard`    | активная запись + плитки + таббар  |
| `ViewDoctor` `/doctor`     | `pages/home` (вариант)              | карточка врача + плитки            |
| `ViewSale` `/sale`         | `pages/home/promo`                  | акции                              |
| `ViewService` `/service`   | `pages/home/services` / `SelectList`| список услуг                       |
| `ViewCategory` `/category` | `create` (панель category)          | выбор категории                    |
| `ViewDoctors` `/doctors`   | (нет — новое)                       | выбор врача                        |
| `ViewBranch` `/branch`     | `create` (branch)                   | выбор филиала                      |
| `ViewDatetime` `/datetime` | `create` (Calendar+TimeSlotGroup)   | выбор даты/времени                 |
| `ViewBooking` `/booking`   | `create` (сетка карточек)           | хаб записи                         |
| `ViewHistory` `/history`   | `pages/history` + `VisitCard`       | история записей                    |

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

## Рабочие принципы для этого репозитория
- Дизайн/вёрстку не «подгоняем под React» — наш UI первичен; переиспользуем
  `UiBtn` и токены из `style.css`, держим единый визуальный язык (зелёный бренд,
  скруглённые карточки `rounded-4xl`, `shadow-accent`, таббар снизу).
- **Контракты API берём из `Документация_API.md`** (актуально), а не из React-путей.
  Из React берём только бизнес-логику флоу (последовательность экранов, что за чем).
- При добавлении API-слоя: держать `company_id` и base-URL в одном месте (env +
  модуль-конфиг), токен — как в оригинале, но абстрагировать под мессенджер-агностик.
- Соблюдать prettier-настройки (табы, без `;`, одинарные кавычки).
- **`CHANGELOG.md` ведём по стандарту [Keep a Changelog 1.0.0](https://keepachangelog.com/en/1.0.0/)**
  и SemVer: заголовок версии `## [x.y.z] - YYYY-MM-DD`, английские названия секций
  (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`) — своих секций
  не выдумываем; текст записей на русском. Незарелиженное — в `## [Unreleased]`.
  Версию в `package.json` держим синхронной с последней записью.
