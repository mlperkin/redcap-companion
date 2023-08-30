import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useTheme, alpha } from "@mui/material";
import { Paper } from "@mui/material";

const tasks = [
  { id: "1", content: "First task" },
  { id: "2", content: "Second task" },
  { id: "3", content: "Third task" },
  { id: "4", content: "Fourth task" },
  { id: "5", content: "Fifth task" },
];

const taskStatus = {
  field_label: {
    name: "Field Label",
    items: tasks,
  },
  omop_table: {
    name: "OMOP Table",
    items: [],
  },
  domain: {
    name: "Domain",
    items: [],
  },
  vocab: {
    name: "Vocab",
    items: [],
  },
};

const onDragEnd = (result, columns, setColumns) => {
  if (!result.destination) return;
  const { source, destination } = result;

  if (source.droppableId !== destination.droppableId) {
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceColumn,
        items: sourceItems,
      },
      [destination.droppableId]: {
        ...destColumn,
        items: destItems,
      },
    });
  } else {
    const column = columns[source.droppableId];
    const copiedItems = [...column.items];
    const [removed] = copiedItems.splice(source.index, 1);
    copiedItems.splice(destination.index, 0, removed);
    setColumns({
      ...columns,
      [source.droppableId]: {
        ...column,
        items: copiedItems,
      },
    });
  }
};

function Todo() {
  const [columns, setColumns] = useState(taskStatus);
  const theme = useTheme();

  console.log("theme", theme);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Mappings</h1>
      <div
        style={{ display: "flex", justifyContent: "center", height: "100%" }}
      >
        <DragDropContext
          onDragEnd={(result) => onDragEnd(result, columns, setColumns)}
        >
          {Object.entries(columns).map(([columnId, column], index) => {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                key={columnId}
              >
                <h2>{column.name}</h2>
                <Paper elevation={3} sx={{margin: '20px'}}>
                  <div style={{ margin: 8 }}>
                    <Droppable droppableId={columnId} key={columnId}>
                      {(provided, snapshot) => {
                        return (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{
                              background: snapshot.isDraggingOver
                                ? alpha(theme.palette.primary.main, 0.1)
                                : theme.palette.primary.secondary,
                              padding: 4,
                              width: 250,
                              minHeight: 500,
                            }}
                          >
                            {column.items.map((item, index) => {
                              return (
                                <Draggable
                                  key={item.id}
                                  draggableId={item.id}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                      <Paper elevation={3}>
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          style={{
                                            userSelect: "none",
                                            padding: 16,
                                            margin: "0 0 8px 0",
                                            minHeight: "50px",

                                            backgroundColor: snapshot.isDragging
                                              ? alpha(
                                                  theme.palette.primary.main,
                                                  0.5
                                                ) // 50% opacity of the primary color
                                              : alpha(
                                                  theme.palette.primary.main,
                                                  1
                                                ),
                                            color:
                                              theme.palette.primary
                                                .contrastText, // Adjust this if you have defined contrastText or another appropriate color
                                            ...provided.draggableProps.style,
                                          }}
                                        >
                                          {item.content}
                                        </div>
                                      </Paper>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}
                          </div>
                        );
                      }}
                    </Droppable>
                  </div>
                </Paper>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
}

export default Todo;
