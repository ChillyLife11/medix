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
  composables/            # useAuth, useBooking, useAppointments
  session.js              # токен / client_id / телефон — только в памяти
  config.js               # API_BASE, COMPANY_ID, MEDIA_BASE, TEST_PHONE, fileUrl
  components/
    ui/UiBtn.vue          # базовая кнопка (варианты color/soft/outline/icon/fluid, to→RouterLink)
    ui/UiLoader.vue       # общий индикатор загрузки
    ui/UiPageTitle.vue
    ui/UiTabbar.vue       # нижний таббар: главная / запись / история
    doctor/DoctorCard.vue
    history/HistoryCard.vue  # карточка записи (услуга / врач / дата + иконка статуса)
    legal/LegalDialog.vue    # шторка «Правовая информация» (reka-ui Dialog)
  assets/fonts/           # Amstelvar, Open Sans
public/                   # favicon.svg + images/ (doctor-*, loading-*, logo.webp, icons.svg)
index.html                # обычный vite-шаблон (SDK мессенджера сейчас не подключён)
```

### Текущий статус
**Готово:**
- **вход по телефону** (слоя мессенджера сейчас нет): сплэш `ViewHome` (`/`) зовёт
  `checkAuth()` и разводит на `/profile` или `/agree`; `ViewAgree` — согласия и
  `signIn()`. Номер берётся из `TEST_PHONE`, сессия живёт в памяти (`src/session.js`);
- **API-слой**: `src/config.js`, `src/api/http.js` (axios + Bearer +
  `apiErrorMessage` + разлогин на 401), `users`, `branches`, `coworkers`,
  `promos`, `appointments`. Dev-прокси `/api` на бэкенд в `vite.config.js`;
- **два сценария записи** (см. «Сценарии записи») → `POST /appointment/create`.
  Выбор живёт в `src/composables/useBooking.js`: модульное состояние + `flow`,
  `startBooking()`, `appointmentPayload()`, `isComplete()`. После успеха —
  `reset()` и переход на `/profile`;
- **записи клиента**: `src/composables/useAppointments.js` (загрузка, отмена,
  форматтеры) отдаёт два списка — `current` (слайдер на `/profile`, кнопка
  «Отменить запись») и `history` (карточки на `/active`, иконка по статусу);
- **кеш справочников на сессию** — внутри `src/api/branches.js` (модульная
  переменная + сохранённый промис): филиалы, а с ними услуги и врачи,
  запрашиваются один раз; экраны берут данные синхронно, без запроса и лоадера
  (`loadedBranches()`, `loadedBranch()`, `loadedAllServices()`,
  `loadedBranchesWithService()`). Записи **не кешируем** — они меняются.

**Ещё НЕ сделано:**
- перенос записи (`/appointment/update`);
- имя/аватар клиента на экранах (сейчас заглушка «Иванов Иван»);
- категории как отдельная сущность: `ViewCategory` на моках и ни в один сценарий
  не встроен;
- текст в `LegalDialog` — рыба (lorem ipsum), заменить на документы клиники;
- слой мессенджера MAX и вход по реальному номеру вместо `TEST_PHONE`.

> ⚠️ **API: по факту работаем по СТАРЫМ (React) путям.** Хост — `VITE_API_HOST`
> (сейчас `https://dental-web.pro`). Новый контракт из `Документация_API.md`
> (ресурсы во множественном числе, id в пути) живой сервер не отдаёт, поэтому в
> коде живут только эти пути:
> - `GET /branch/index` — филиалы **с вложенными `services[]` и `coworkers[]`**;
>   отдельных запросов за услугами и врачами нет, каталог услуг собираем из этого
>   же ответа;
> - `GET /coworker/get-schedule?user_id=&branch_id=&date=` — расписание врача;
>   функция в `api/coworkers.js` осталась, но **сейчас не вызывается** (см. сетку
>   времени в «решениях»);
> - `GET /promo/index`, `GET /promo/view`;
> - `GET /appointment/index?filter[client_id]=&sort=-date`,
>   `POST /appointment/create`, `POST /appointment/cancel?id=`;
> - `GET /user/by-phone?phone=`, `POST /user/register-telegram?source=max`.
>
> Новый контракт — цель на будущее, но не переписывать вслепую: сверяться с тем,
> что реально отвечает сервер (без токена всё отдаёт **401**).
>
> **Статусы записи:** `0` лист ожидания, `1` отправлен в МИС, `2` напоминание
> отправлено, `4` подтверждено, `5` выполнено, `6` отменено. Поле называется
> `status` и лежит в корне записи, но приходит **строкой** (`"6"`, не `6`) —
> поэтому сравниваем через `Number()`. Проверено на живом ответе
> `/appointment/index`: `id, date, start, end, status, timestamp, client,
> services, categories, branch, master`. Делим их **строго по
> статусу, без оглядки на дату**: `isHistorical()` — это `5` и `6` (экран истории),
> `isCurrent()` — всё остальное, включая записи без статуса (слайдер на главной).

### Авторизация: сейчас по телефону, слоя мессенджера нет
`useMessenger`, SDK-скрипт в `index.html` и вход по данным MAX **удалены**.
Сейчас: `useAuth.checkAuth()` → `signIn()` берёт `TEST_PHONE` из `src/config.js`,
ищет клиента `GET /user/by-phone`, а если такого номера нет — регистрирует
`POST /user/register-telegram?source=max`. В обоих случаях в ответе
`access_token` → `setSession()` в `src/session.js`.

Сессия живёт только пока открыта страница: ни токен, ни `client_id` в
`localStorage` не пишутся. Поэтому `router.beforeEach` при первой навигации
всегда отправляет на `/` — сплэш заново находит клиента и получает свежий токен.

Когда мессенджер вернём (факты по SDK проверены, менять не надо):
- скрипт `https://st.max.ru/js/max-web-app.js` в `index.html`; глобал
  `window.WebApp` создаётся **синхронно** и разбирает пользователя из URL ещё до
  старта Vue — читать один раз, без поллинга/async/реактивности;
- `WebApp.ready()` сигналит хосту; метода `expand()` **нет** (телеграмизм);
- пользователь — `WebApp.initDataUnsafe.user` = `{ id, first_name, last_name,
  username, language_code, photo_url }`; `WebApp.platform` ∈
  `ios|android|desktop|web` (иначе `null` = вне MAX); телефон —
  `WebApp.requestContact()`;
- по `user.id` дёрнуть `users/check-chat-id`, если клиента нет — согласия
  (`ViewAgree`) и `register-telegram?source=max` с реальным номером вместо `TEST_PHONE`.

### Локальная разработка
Основной контур — обычный браузер: `pnpm dev`, порт **5174** (задан в
`vite.config.js`), вход по `TEST_PHONE`. Мока мессенджера не нужно — слоя нет.

Для проверки в реальном MAX (когда слой вернём) нужен публичный HTTPS: туннель
(`cloudflared tunnel --url http://localhost:5174` или `ngrok`), URL зарегистрировать
в `business.max.ru/self` (Чат-боты → Расширенные настройки), открывать через
`https://max.ru/<bot>?startapp=`. В `vite.config.js` для этого включены
`server.host` и `server.allowedHosts`. Эмулятора/dev-режима у MAX нет.

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

Роуты сейчас **плоские**: `/`, `/agree`, `/profile`, `/sale`, `/active`,
`/branch`, `/service`, `/category`, `/doctors`, `/datetime` — в оригинале это был
единый экран `create` с модалкой и панелями. Мы разбили flow на отдельные экраны —
это осознанно, наш UX.

### Соответствие экранов (наш ↔ оригинал)
| Наш роут / View            | Оригинал (React)                    | Назначение                         |
|----------------------------|-------------------------------------|------------------------------------|
| `ViewHome` `/`             | `pages/welcome`                     | сплэш/загрузка                     |
| `ViewAgree` `/agree`       | `pages/welcome` (Popup+Checkbox)    | согласия ПДн перед регистрацией    |
| `ViewProfile` `/profile`   | `pages/home/route` + `VisitCard`    | **главный экран**: слайдер записей, плитки, правовая информация, таббар |
| `ViewActive` `/active`     | `pages/history` + `VisitCard`       | история: выполненные и отменённые  |
| `ViewSale` `/sale`         | `pages/home/promo`                  | акции                              |
| `ViewService` `/service`   | `pages/home/services` / `SelectList`| выбор услуги (филиала или всей клиники) |
| `ViewCategory` `/category` | `create` (панель category)          | выбор категории (на моках)         |
| `ViewDoctors` `/doctors`   | (нет — новое)                       | выбор врача                        |
| `ViewBranch` `/branch`     | `create` (branch)                   | выбор филиала                      |
| `ViewDatetime` `/datetime` | `create` (Calendar+TimeSlotGroup)   | выбор даты/времени + создание записи |

Главный экран — **`/profile`**: туда ведут сплэш, регистрация, возврат из акций
и переход после успешного создания записи. Отдельного экрана истории нет
(`/history` удалён) — актуальные записи показываются на `/profile` (слайдер),
а завершённые (выполненные и отменённые) карточками `HistoryCard` — на `/active`.
Пересечения между списками нет: каждая запись попадает ровно в один.

### Сценарии записи (наш UX)
Сценария два, различаются только первыми двумя шагами. Порядок хранит `flow` в
`useBooking`; точка входа объявляет его через `startBooking(kind)`, который заодно
сбрасывает выбор от предыдущей записи.

| `flow`      | Точка входа                                              | Порядок шагов                        |
|-------------|----------------------------------------------------------|--------------------------------------|
| `'branch'`  | «Записаться» на `/profile` и `/active`, плюс в таббаре    | филиал → услуга → врач → дата/время  |
| `'service'` | плитка «Услуги» на `/profile` и `/active`                 | услуга → филиал → врач → дата/время  |

- `ViewService`: в `'service'` показывает каталог **всех** услуг клиники
  (`getAllServices()` — склейка `branch.services` по всем филиалам без дублей),
  в `'branch'` — услуги выбранного филиала;
- `ViewBranch`: в `'service'` показывает **только филиалы, где эта услуга есть**
  (`getBranchesWithService()`). Если он один — остаётся один, карточка на всю
  ширину и подсказка, но кнопку жмёт пользователь;
- `ViewDoctors` одинаков в обоих: врачи филиала, отфильтрованные по услуге
  (`coworker.services`);
- точки входа — обработчики `@click`, а **не** `to="/branch"`: сценарий должен
  задаваться явно, а не угадываться по состоянию;
- **«Повторить»** в карточке истории — третий вход: `startRepeat()` подставляет
  филиал, услугу и врача из прошлой записи (`repeatSelection()` достаёт
  `branch.id`, `services[0].id`, `master.id`) и ведёт сразу на `/datetime`.
  Дату и время не переносим — они в прошлом. Если чего-то из трёх в записи нет,
  ведём на `/branch`: найденное уже подставлено, остальное выберут руками.

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
- MAX-скрипт: `https://st.max.ru/js/max-web-app.js` (в **нашем** `index.html` сейчас не подключён — слой мессенджера снят).
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

- **Время записи.** Сетка **статичная и от расписания врача не зависит**:
  рабочий день клиники `09:00 … 18:00` с шагом в час (`WORK_FROM_HOUR` /
  `WORK_TO_HOUR` в `ViewDatetime`), записаться можно на любой из этих часов.
  `get-schedule` с экрана убран вместе с лоадером и ошибкой загрузки — свободен
  ли конкретный час, проверяет бэкенд при создании записи.
  Ограничение одно: **не раньше чем через час** от текущего времени (`LEAD_MS`) —
  в 13:20 ближайший доступный час 15:00, а 14:00 уже нет. Прошедшие часы видны, но
  `disabled`; `now` обновляется раз в минуту, поэтому граница едет вместе с часами.
  На другие дни ограничение не действует — там доступны все часы.
- **`end` в теле записи** — `start + 30 минут` (константа `APPOINTMENT_MINUTES`
  в `useBooking`), как в примере запроса от бэка. Сетка при этом часовая —
  вопрос к бэку открыт; если длительность придёт в услуге, считать от неё.
- **`Status` в теле `appointment/create` — с большой буквы**, так поле называется
  в API. Не «исправлять».
- **Кеш только для справочников** и живёт он **внутри `api/branches.js`**
  (модульная переменная + сохранённый промис, отдельного `lib/cache.js` больше
  нет). У каждого асинхронного геттера есть синхронный близнец `loaded*()`,
  который отдаёт уже загруженное или `null` — поэтому при возврате назад нет ни
  запроса, ни лоадера. Ошибку не кешируем (промис обнуляется). Записи всегда
  запрашиваем заново.
- **Услуги и врачи приходят вложенными в филиал** (`/branch/index`), своих
  эндпоинтов у них нет. Каталог услуг = склейка `branch.services` по всем
  филиалам с дедупликацией по `id`; id услуги сквозной — по нему же фильтруются
  и филиалы, и врачи (`coworker.services`).
- **Статусы записи → иконка в истории.** `statusKind()` в `api/appointments`
  отдаёт `'complete' | 'canceled' | 'pending'`, `HistoryCard` принимает `status`
  (не булев флаг): `5` — галочка, `6` — крест, всё остальное и отсутствие
  статуса — часы.
- **ФИО врача перепутаны местами** в ответе бэка: фамилия лежит в
  `profile.first_name`, имя — в `profile.last_name`. В `ViewDoctors` это учтено,
  не «чинить» переименованием.
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
