import { useState, useRef, useEffect } from "react";

const ChecklistManager = ({selectedEvent}) => {

  const [checklists, setChecklists] = useState([
    {
      id: 1,
      title: "Checklist",
    //   items: [{ id: 1, text: "Test 1", completed: true }],
      items:  [],
      showCompleted: true,
      isAdding: false,
      newItemText: "",
    },
  ]);

    useEffect(()=>{

            const checkListArray = selectedEvent?.Checklist?.map(e => {
                return {
                    id: e.ID, text: e.Checklist, completed: e.Completed === "true"
                }
            } )

            console.log("checkListArray", checkListArray)


            setChecklists([
            {
                id: 1,
                title: "Checklist",
                items: checkListArray || [],
                showCompleted: true,
                isAdding: false,
                newItemText: "",
            },
    ]);

    }, [selectedEvent])

  const inputRefs = useRef({});

  // Toggle complete
  const toggleItem = (listId, itemId) => {

    let updatedCompletedStatus = null; // 👈 store value here


    const updated = checklists.map((list) =>
      list.id === listId
        ? {
            ...list,
            items: list.items.map((item) => {
                if (item.id === itemId) {
                updatedCompletedStatus = !item.completed; // 👈 capture it
                return { ...item, completed: updatedCompletedStatus };
                }
                return item;
            }),
          }
        : list
    );

    setChecklists(updated);

    console.log(updatedCompletedStatus)

    // 🔌 API
    // updateChecklistItem(listId, itemId)
  };

  // Show input field
  const startAdding = (listId) => {
    const updated = checklists.map((list) =>
      list.id === listId
        ? { ...list, isAdding: true }
        : list
    );
    setChecklists(updated);

    setTimeout(() => {
      inputRefs.current[listId]?.focus();
    }, 0);
  };

  // Handle typing
  const handleInputChange = (listId, value) => {
    setChecklists(
      checklists.map((list) =>
        list.id === listId ? { ...list, newItemText: value } : list
      )
    );
  };

  // Save item
  const saveItem = (listId) => {
    const list = checklists.find((l) => l.id === listId);
    if (!list.newItemText.trim()) return;


     var config = {
        form_name: "Checklist",
        payload: {
            data: {
                Checklist : list.newItemText,
                Task: selectedEvent?.ID
            }
        }
    };

    ZOHO.CREATOR.DATA.addRecords(config).then(function (response) {
        if (response.code == 3000) {
            console.log(response);
            const updated = checklists.map((l) => l.id === listId ? {
                    ...l,
                    items: [
                    ...l.items,
                    {
                        id: response?.data?.ID,
                        text: l.newItemText,
                        completed: false,
                    },
                    ],
                    newItemText: "",
                    isAdding: false,
                }
                : l
            );

            setChecklists(updated);
        }
    });


    // 🔌 API
    // createChecklistItem(listId, list.newItemText)

    // addChecklist(list.newItemText)
    
  };



  // Cancel input
  const cancelAdding = (listId) => {
    setChecklists(
      checklists.map((list) =>
        list.id === listId
          ? { ...list, isAdding: false, newItemText: "" }
          : list
      )
    );
  };


  return (
    <div className="container py-4">
      {checklists.map((list) => {
        const completedCount = list.items.filter(i => i.completed).length;

        return (
          <div
            key={list.id}
            className="card shadow-sm border-0 mb-4"
            style={{ borderRadius: "14px" }}
          >
            <div className="card-body">
              {/* Header */}
              <div className="d-flex justify-content-between mb-3">
                <div className="fw-semibold text-muted">
                  {list.title} ({completedCount}/{list.items.length})
                </div>
              </div>

              {/* Items */}
              <ul className="list-group list-group-flush">
                {list.items.map((item) => (
                  <li
                    key={item.id}
                    className="list-group-item d-flex align-items-center justify-content-between px-0"
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={item.completed}
                        onChange={() => toggleItem(list.id, item.id)}
                      />
                      <span
                        style={{
                          textDecoration: item.completed ? "line-through" : "none",
                          color: item.completed ? "#999" : "#222",
                        }}
                      >
                        {item.text}
                      </span>
                    </div>

                    {item.completed && (
                      <i className="bi bi-check-circle-fill text-success"></i>
                    )}
                  </li>
                ))}

                {/* Inline Input */}
                {list.isAdding && (
                  <li className="list-group-item px-0 border-0">
                    <input
                      ref={(el) => (inputRefs.current[list.id] = el)}
                      type="text"
                      className="form-control"
                      placeholder="Enter checklist item..."
                      value={list.newItemText}
                      onChange={(e) =>
                        handleInputChange(list.id, e.target.value)
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveItem(list.id);
                        if (e.key === "Escape") cancelAdding(list.id);
                      }}
                      onBlur={() => cancelAdding(list.id)}
                      autoFocus
                    />
                  </li>
                )}
              </ul>

              {/* Add Button */}
              {!list.isAdding && (
                <button
                  className="btn btn-link text-decoration-none mt-2"
                  onClick={() => startAdding(list.id)}
                >
                  <i className="bi bi-plus-circle me-1"></i> Add Checklist
                </button>
              )}
            </div>
          </div>
        );
      })}

    </div>
  );
};

export default ChecklistManager;