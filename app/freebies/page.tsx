import Link from "next/link";

export default function FreebiesPage() {
  return (
    <main className="min-h-screen bg-[var(--fd-cream)] p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>
            <h1 className="text-5xl font-bold">
              🎁 Freebies Library
            </h1>

            <p className="text-gray-600 mt-2">
              Download free worksheets, flashcards and learning resources.
            </p>
          </div>

          <Link href="/dashboard">
            <button className="bg-[var(--fd-blue)] text-white px-5 py-3 rounded-xl hover:bg-[var(--fd-purple)]">
              ← Back to Dashboard
            </button>
          </Link>

        </div>

        {/* Banner */}
        <div className="bg-[var(--fd-blue)] text-white p-8 rounded-3xl shadow-xl mb-8">

          <h2 className="text-3xl font-bold">
            Free Learning Resources
          </h2>

          <p className="mt-3 text-lg">
            Enjoy our collection of printable worksheets, flashcards and activity packs.
          </p>

        </div>

        {/* Freebies Grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Alphabet */}
          <a
            href="/freebies/alphabet.pdf"
            target="_blank"
            className="bg-white rounded-3xl shadow-xl p-8 hover:scale-105 transition"
          >
            <h2 className="text-3xl font-bold mb-3">
              📄 Alphabet A-Z Worksheet
            </h2>

            <p className="text-gray-600 mb-4">
              Learn uppercase and lowercase letters.
            </p>

            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
              Download
            </button>
          </a>

          {/* Numbers */}
          <a
            href="/freebies/numbers.pdf"
            target="_blank"
            className="bg-white rounded-3xl shadow-xl p-8 hover:scale-105 transition"
          >
            <h2 className="text-3xl font-bold mb-3">
              🔢 Number Tracing Worksheet
            </h2>

            <p className="text-gray-600 mb-4">
              Practice number recognition and tracing.
            </p>

            <button className="bg-green-500 text-white px-4 py-2 rounded-lg">
              Download
            </button>
          </a>

          {/* Colouring */}
          <a
            href="/freebies/coloring.pdf"
            target="_blank"
            className="bg-white rounded-3xl shadow-xl p-8 hover:scale-105 transition"
          >
            <h2 className="text-3xl font-bold mb-3">
              🎨 Colouring Pack
            </h2>

            <p className="text-gray-600 mb-4">
              Fun colouring activities for preschool children.
            </p>

            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg">
              Download
            </button>
          </a>

          {/* Flashcards */}
          <a
            href="/freebies/flashcards.pdf"
            target="_blank"
            className="bg-white rounded-3xl shadow-xl p-8 hover:scale-105 transition"
          >
            <h2 className="text-3xl font-bold mb-3">
              🃏 Flashcard Pack
            </h2>

            <p className="text-gray-600 mb-4">
              Printable flashcards for early learning.
            </p>

            <button className="bg-[#fbf0f6]0 text-white px-4 py-2 rounded-lg">
              Download
            </button>
          </a>

        </div>

      </div>

    </main>
  );
}