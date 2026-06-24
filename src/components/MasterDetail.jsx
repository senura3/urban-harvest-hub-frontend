import React from 'react'

export const MasterDetail = ({
  items = [],
  selectedId = null,
  renderListItem = () => null,
  renderDetail = () => null,
  placeholderText = "Select an item from the list to view details."
}) => {
  const selectedItem = items.find(item => (item.id || item._id) === selectedId)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-[50vh]">
      
      {/* Master List Pane (Left Column on Desktop, Full Width on Mobile) */}
      <section 
        className={`lg:col-span-5 space-y-4 max-h-[80vh] overflow-y-auto pr-1 pb-4 ${
          selectedId ? 'hidden lg:block' : 'block'
        }`}
        aria-label="Items List"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {items.map(item => renderListItem(item))}
        </div>
        {items.length === 0 && (
          <div className="text-center py-12 text-stone-500 dark:text-stone-400">
            No items match your selection.
          </div>
        )}
      </section>

      {/* Detail Pane (Right Column on Desktop, Full Width on Mobile) */}
      <main 
        className={`lg:col-span-7 bg-white dark:bg-stone-900 border border-stone-150 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto ${
          selectedId ? 'block' : 'hidden lg:flex lg:items-center lg:justify-center lg:text-center min-h-[400px]'
        }`}
        aria-label="Item Details"
      >
        {selectedItem ? (
          renderDetail(selectedItem)
        ) : (
          <div className="text-stone-550 dark:text-stone-400 font-medium">
            <svg className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>{placeholderText}</p>
          </div>
        )}
      </main>

    </div>
  )
}

export default MasterDetail
