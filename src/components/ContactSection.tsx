export function ContactSection() {
  return (
    <section id="contact" className="bg-[#F8F8F8] px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2
              className="text-3xl font-medium leading-[1.1] tracking-tight text-[#141414] md:text-5xl"
              data-editable
              data-preset-text="contact-headline"
            >
              Book a call
            </h2>
            <p
              className="mt-4 text-[15px] leading-relaxed text-[#A5A5A5]"
              data-editable
              data-preset-text="contact-subtitle"
            >
              Share your goals and we will match you with an advisor and curated listings.
            </p>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <form className="space-y-6 bg-white p-8 shadow-sm md:p-12 border border-black/5">
              <label className="block">
                <span className="text-[13px] font-medium text-[#141414]">Full name</span>
                <input
                  type="text"
                  className="mt-2 w-full border border-black/10 bg-[#F8F8F8] px-4 py-3 text-[14px] outline-none focus:border-black/30"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-[#141414]">Email</span>
                <input
                  type="email"
                  className="mt-2 w-full border border-black/10 bg-[#F8F8F8] px-4 py-3 text-[14px] outline-none focus:border-black/30"
                  placeholder="you@email.com"
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium text-[#141414]">Message</span>
                <textarea
                  rows={4}
                  className="mt-2 w-full resize-none border border-black/10 bg-[#F8F8F8] px-4 py-3 text-[14px] outline-none focus:border-black/30"
                  placeholder="Tell us about the property you are seeking"
                />
              </label>
              <button
                type="button"
                className="bg-[#141414] px-9 py-4 text-[13px] font-medium uppercase tracking-wider text-white shadow-2xl transition-colors hover:bg-black/80"
              >
                Book a call
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
