import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Neuvesca",
  description:
    "Write to the Neuvesca studio — for orders, custom pours, press, and quiet conversations.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pageIntro pageIntroCentered">
        <p className="eyebrow">Write to us</p>
        <h1>We answer slowly, and always.</h1>
        <p className="lede">
          For orders, custom pours, wholesale enquiries, or simply to tell us
          which scent you&rsquo;ve been keeping in the kitchen — leave a note
          and we&rsquo;ll write back, usually within two days.
        </p>
      </section>

      <section className="contactSection">
        <div className="contactDetails">
          <div>
            <p className="eyebrow">Studio</p>
            <p className="contactLine">
              14 Rue des Fleurs<br />
              Quartier Latin, 75005<br />
              Paris, France
            </p>
          </div>
          <div>
            <p className="eyebrow">Hours</p>
            <p className="contactLine">
              Tuesday — Saturday<br />
              10h to 18h<br />
              By appointment Sundays
            </p>
          </div>
          <div>
            <p className="eyebrow">Direct</p>
            <p className="contactLine">
              <a href="mailto:hello@neuvesca.com">hello@neuvesca.com</a><br />
              <a href="tel:+33144000000">+33 1 44 00 00 00</a>
            </p>
          </div>
          <div>
            <p className="eyebrow">Press &amp; Wholesale</p>
            <p className="contactLine">
              <a href="mailto:atelier@neuvesca.com">atelier@neuvesca.com</a>
            </p>
          </div>
        </div>

        <form className="contactForm">
          <div className="contactFormHeader">
            <p className="eyebrow">Leave a note</p>
            <h2>Tell us what you&rsquo;re looking for.</h2>
          </div>

          <div className="contactRow">
            <label>
              <span>Name</span>
              <input type="text" name="name" placeholder="Your name" required />
            </label>
            <label>
              <span>Email</span>
              <input type="email" name="email" placeholder="you@example.com" required />
            </label>
          </div>

          <label>
            <span>Subject</span>
            <select name="subject" defaultValue="general">
              <option value="general">A general question</option>
              <option value="order">An order or shipping note</option>
              <option value="custom">A custom pour</option>
              <option value="wholesale">Wholesale &amp; stockists</option>
              <option value="press">Press</option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              name="message"
              rows={6}
              placeholder="A few sentences is plenty."
              required
            />
          </label>

          <button type="submit" className="button primary">
            Send the note
          </button>
        </form>
      </section>
    </>
  );
}
