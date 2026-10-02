// src/components/FeedbackForm.jsx

import { useState } from "react";
import "./FeedbackForm.css";


function FeedbackForm() {
  // --- Состояние значений полей ---
  // Каждый инпут — управляемый компонент: его значение хранится в state.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Доп. задание 3: чекбокс «Хочу получить ответ».
  // Пока включён (по умолчанию) — email обязателен, как и было.
  // Если пользователь его выключит — email можно оставить пустым.
  const [wantsReply, setWantsReply] = useState(true);

  // --- Состояние ошибки валидации ---
  // Храним текст ошибки для каждого поля отдельно.
  // Если ошибки нет — значение null.
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    message: null,
  });

  // --- Состояние «тронутых» полей ---
  // Поле считается «тронутым» (touched), если пользователь хотя бы раз
  // вышел из него (blur). До этого момента не показываем ошибки,
  // даже если значение невалидно — это снижает раздражение пользователя.
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });

  // --- Состояние процесса отправки ---
  // Пока идёт «запрос» — блокируем кнопку и показываем индикатор.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Состояние успешной отправки ---
  // После успешной отправки показываем сообщение вместо формы.
  const [submitted, setSubmitted] = useState(false);

  // --- Функции валидации ---
  // Имя: минимум 2 символа, только буквы, пробелы и дефис.
  const validateName = (value) => {
    if (!value.trim()) return "Имя обязательно для заполнения";
    if (value.trim().length < 2) return "Минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()))
      return "Только буквы, пробелы и дефис";
    return null; // нет ошибки
  };

  // Email: проверка через регулярное выражение.
  // Доп. задание 3: required передаётся явно (а не берётся из wantsReply
  // через замыкание), чтобы функция всегда использовала актуальное значение,
  // даже когда её вызывают сразу после переключения чекбокса.
  const validateEmail = (value, required = wantsReply) => {
    if (!value.trim()) {
      return required ? "Email обязателен для заполнения" : null;
    }
    // Простая, но достаточно надёжная проверка формата.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Некорректный формат email";
    return null;
  };

  // Доп. задание 2: телефон в формате +7 (XXX) XXX-XX-XX.
  // Поле необязательное: пустое значение — не ошибка, но если
  // пользователь начал вводить номер, он должен быть введён полностью.
  const validatePhone = (value) => {
    if (!value) return null;
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      return "Введите номер полностью: +7 (XXX) XXX-XX-XX";
    }
    return null;
  };

  // Сообщение: минимум 10 символов.
  const validateMessage = (value) => {
    if (!value.trim()) return "Сообщение обязательно для заполнения";
    if (value.trim().length < 10) return "Минимум 10 символов";
    if(value.trim().length > 500) return "Максимум 500 символов";
    return null;
  };

  // Универсальный объект валидаторов — удобно перебирать в цикле.
  const validators = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    message: validateMessage,
  };

  // Доп. задание 2: маска телефона.
  // Берёт только цифры из введённого значения и заново собирает
  // строку вида "+7 (XXX) XXX-XX-XX" по мере набора.
  const formatPhone = (rawValue) => {
    let digits = rawValue.replace(/\D/g, "");

    // Ведущую 7 или 8 (код страны / старый формат) не дублируем —
    // "+7" мы и так подставляем сами.
    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10); // максимум 10 цифр после кода страны

    if (digits.length === 0) return "";

    let formatted = "+7";
    formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ")";
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  };

  // Обработчик изменения поля.
  // Принимает имя поля и новое значение, проверяет и обновляет состояние.
  const handleChange = (field, value) => {
    // Для телефона сначала прогоняем значение через маску.
    const nextValue = field === "phone" ? formatPhone(value) : value;

    // Обновляем значение соответствующего поля через switch.
    switch (field) {
      case "name":
        setName(nextValue);
        break;
      case "email":
        setEmail(nextValue);
        break;
      case "phone":
        setPhone(nextValue);
        break;
      case "message":
        setMessage(nextValue);
        break;
      // no default
    }

    // Если поле уже тронуто — сразу валидируем при наборе.
    // Если нет — не показываем ошибки, пока пользователь не уйдёт из поля.
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validators[field](nextValue),
      }));
    }
  };

  // Обработчик потери фокуса.
  const handleBlur = (field) => {
    // Помечаем поле как тронутое.
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Получаем текущее значение поля.
    const currentValue =
      field === "name"
        ? name
        : field === "email"
          ? email
          : field === "phone"
            ? phone
            : message;

    // Валидируем и записываем результат.
    setErrors((prev) => ({
      ...prev,
      [field]: validators[field](currentValue),
    }));
  };

  // Доп. задание 3: переключение чекбокса «Хочу получить ответ».
  // Сразу пересчитываем ошибку email явным required, а не через
  // validators.email — иначе функция использовала бы ещё не обновлённое
  // состояние wantsReply (React применит setWantsReply только на следующем рендере).
  const handleWantsReplyChange = (checked) => {
    setWantsReply(checked);
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email, checked),
      }));
    }
  };

  // Обработчик отправки формы.
  const handleSubmit = (e) => {
    e.preventDefault(); // Предотвращаем перезагрузку страницы.

    // 1. Валидируем все поля сразу.
    const newErrors = {
      name: validateName(name),
      email: validateEmail(email, wantsReply),
      phone: validatePhone(phone),
      message: validateMessage(message),
    };

    // 2. Записываем ошибки и помечаем все поля как тронутые.
    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    // 3. Если хотя бы одна ошибка есть — не отправляем.
    if (Object.values(newErrors).some((err) => err !== null)) {
      return; // Прерываем отправку.
    }

    // 4. Имитируем отправку на сервер.
    setIsSubmitting(true);
    // setTimeout имитирует сетевой запрос с задержкой 1.5 секунды.
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      // В реальном проекте здесь был бы fetch / axios:
      // fetch("/api/feedback", { method: "POST", body: ... })
    }, 1500);
  };

  // Возвращает строку классов для инпута в зависимости от состояния.
  const getInputClass = (field) => {
    // Базовый класс
    const classes = ["field__input"];
    // Если поле тронуто и есть ошибка — добавляем класс ошибки.
    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    }
    // Если поле тронуто и ошибки нет — добавляем класс успеха.
    else if (touched[field] && !errors[field]) {
      classes.push("field__input--valid");
    }
    // Для textarea добавляем отдельный класс.
    if (field === "message") {
      classes.push("field__input--textarea");
    }
    return classes.join(" ");
  };

  // Если форма успешно отправлена — показываем благодарность.
  if (submitted) {
    return (
      <div className="feedback-form feedback-form--success">
        <h2 className="feedback-form__title">Спасибо за обращение!</h2>
        <p className="feedback-form__text">
          Мы свяжемся с вами в ближайшее время.
        </p>
        <button
          type="button"
          className="feedback-form__submit"
          onClick={() => {
            // Сбрасываем форму к начальному состоянию.
            setName("");
            setEmail("");
            setPhone("");
            setMessage("");
            setWantsReply(true);
            setErrors({ name: null, email: null, phone: null, message: null });
            setTouched({ name: false, email: false, phone: false, message: false });
            setSubmitted(false);
          }}
        >
          Отправить ещё одно сообщение
        </button>
      </div>
    );
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      {/* Поле «Имя» */}
      <div className="field">
        <label htmlFor="name" className="field__label">
          Имя
        </label>
        <input
          id="name"
          type="text"
          className={getInputClass("name")}
          value={name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
        />
        {/* Блок ошибки появляется только если поле тронуто И есть ошибка */}
        {touched.name && errors.name && (
          <span className="field__error">{errors.name}</span>
        )}
      </div>

      {/* Поле «Email» */}
      <div className="field">
        <label htmlFor="email" className="field__label">
          Email
        </label>
        <input
          id="email"
          type="email"
          className={getInputClass("email")}
          value={email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
        />
        {touched.email && errors.email && (
          <span className="field__error">{errors.email}</span>
        )}
      </div>

      {/* Доп. задание 3: чекбокс делает email обязательным или нет */}
      <div className="field field--checkbox">
        <label className="field__checkbox-label">
          <input
            type="checkbox"
            checked={wantsReply}
            onChange={(e) => handleWantsReplyChange(e.target.checked)}
          />
          Хочу получить ответ
        </label>
      </div>

      {/* Доп. задание 2: поле «Телефон» с маской ввода */}
      <div className="field">
        <label htmlFor="phone" className="field__label">
          Телефон
        </label>
        <input
          id="phone"
          type="tel"
          className={getInputClass("phone")}
          value={phone}
          placeholder="+7 (999) 999-99-99"
          onChange={(e) => handleChange("phone", e.target.value)}
          onBlur={() => handleBlur("phone")}
        />
        {touched.phone && errors.phone && (
          <span className="field__error">{errors.phone}</span>
        )}
      </div>

      {/* Поле «Сообщение» */}
      <div className="field">
        <label htmlFor="message" className="field__label">
          Сообщение
        </label>
        <textarea
          id="message"
          className={getInputClass("message")}
          value={message}
          onChange={(e) => handleChange("message", e.target.value)}
          onBlur={() => handleBlur("message")}
          rows={5}
          maxLength={500}
        />
        <span className="field__counter">{message.length} / 500</span>
        {touched.message && errors.message && (
          <span className="field__error">{errors.message}</span>
        )}
      </div>

      <button
        type="submit"
        className="feedback-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Отправка…" : "Отправить"}
      </button>
    </form>
  );
}

export default FeedbackForm;
