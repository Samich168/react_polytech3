// src/components/FeedbackForm.jsx

import { useState } from "react";
import "./FeedbackForm.css";


function FeedbackForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");


  const [wantsReply, setWantsReply] = useState(true);


  const [errors, setErrors] = useState({
    name: null,
    email: null,
    phone: null,
    message: null,
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    message: false,
  });


  const [isSubmitting, setIsSubmitting] = useState(false);


  const [submitted, setSubmitted] = useState(false);


  const validateName = (value) => {
    if (!value.trim()) return "Имя обязательно для заполнения";
    if (value.trim().length < 2) return "Минимум 2 символа";
    if (!/^[a-zA-Zа-яА-ЯёЁ\s-]+$/.test(value.trim()))
      return "Только буквы, пробелы и дефис";
    return null; // нет ошибки
  };


  const validateEmail = (value, required = wantsReply) => {
    if (!value.trim()) {
      return required ? "Email обязателен для заполнения" : null;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
      return "Некорректный формат email";
    return null;
  };


  const validatePhone = (value) => {
    if (!value) return null;
    if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(value)) {
      return "Введите номер полностью: +7 (XXX) XXX-XX-XX";
    }
    return null;
  };

  const validateMessage = (value) => {
    if (!value.trim()) return "Сообщение обязательно для заполнения";
    if (value.trim().length < 10) return "Минимум 10 символов";
    if(value.trim().length > 500) return "Максимум 500 символов";
    return null;
  };

  const validators = {
    name: validateName,
    email: validateEmail,
    phone: validatePhone,
    message: validateMessage,
  };


  const formatPhone = (rawValue) => {
    let digits = rawValue.replace(/\D/g, "");


    if (digits.startsWith("7") || digits.startsWith("8")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10); 

    if (digits.length === 0) return "";

    let formatted = "+7";
    formatted += ` (${digits.slice(0, 3)}`;
    if (digits.length >= 3) formatted += ")";
    if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
    if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
    if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
    return formatted;
  };


  const handleChange = (field, value) => {
    const nextValue = field === "phone" ? formatPhone(value) : value;

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
    }

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validators[field](nextValue),
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const currentValue =
      field === "name"
        ? name
        : field === "email"
          ? email
          : field === "phone"
            ? phone
            : message;

    setErrors((prev) => ({
      ...prev,
      [field]: validators[field](currentValue),
    }));
  };

  const handleWantsReplyChange = (checked) => {
    setWantsReply(checked);
    if (touched.email) {
      setErrors((prev) => ({
        ...prev,
        email: validateEmail(email, checked),
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(name),
      email: validateEmail(email, wantsReply),
      phone: validatePhone(phone),
      message: validateMessage(message),
    };

    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(newErrors).some((err) => err !== null)) {
      return; 
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1500);
  };

  const getInputClass = (field) => {
    const classes = ["field__input"];
    if (touched[field] && errors[field]) {
      classes.push("field__input--error");
    }
    else if (touched[field] && !errors[field]) {
      classes.push("field__input--valid");
    }
    if (field === "message") {
      classes.push("field__input--textarea");
    }
    return classes.join(" ");
  };

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
