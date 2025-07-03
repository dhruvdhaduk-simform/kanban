import { useState } from 'react';
import { TaskCard } from '@/components/TaskCard';
import type { Column, Id, Task } from '@/types';
import { TrashIcon } from '@/icons/TrashIcon';
import { PlusIcon } from '@/icons/PlusIcon';

interface ColumnContainerProps {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;
    createTask: (columnId: Id) => void;
    tasks: Array<Task>;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    onDragStart: (type: 'Column' | 'Task', id: Id) => void;
    onDrop: (targetId: Id) => void;
    dragging: { type: 'Column' | 'Task'; id: Id } | null;
    setDragOver: (id: Id | null) => void;
    dragOver: Id | null;
}

export function ColumnContainer({
    column,
    deleteColumn,
    updateColumn,
    createTask,
    tasks,
    deleteTask,
    updateTask,
    onDragStart,
    onDrop,
    dragging,
    setDragOver,
}: ColumnContainerProps) {
    const [editMode, setEditMode] = useState(false);

    const handleDrop = () => {
        onDrop(column.id);
        setDragOver(null);
    };

    return (
        <div
            className={`bg-columnBackgroundColor w-[380px] h-[600px] max-h-[600px] rounded-md flex flex-col ${
                dragging?.type === 'Column' && dragging.id === column.id
                    ? 'border-2 border-blue-500'
                    : ''
            }`}
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(column.id);
            }}
            onDrop={handleDrop}
        >
            <div
                onClick={() => setEditMode(true)}
                className={`bg-mainBackgroundColor text-md h-[60px] rounded-md rounded-b-none p-3 font-bold border-columnBackgroundColor border-4 flex items-center justify-between cursor-grab`}
                draggable
                onDragStart={() => onDragStart('Column', column.id)}
            >
                <div className="flex items-center gap-2 cursor-pointer">
                    <div className="flex justify-center items-center bg-columnBackgroundColor px-2 py-1 text-sm rounded-full">
                        {tasks.length}
                    </div>
                    {!editMode && (
                        <p className="p-2 pl-[9px]">{column.title}</p>
                    )}
                    {editMode && (
                        <input
                            className="bg-black focus:border-blue-500 border rounded outline-none px-2"
                            value={column.title}
                            autoFocus
                            onChange={(e) =>
                                updateColumn(column.id, e.target.value)
                            }
                            onBlur={() => setEditMode(false)}
                            onKeyDown={(e) => {
                                if (e.key !== 'Enter') return;
                                setEditMode(false);
                            }}
                        />
                    )}
                </div>
                <button
                    onClick={() => {
                        deleteColumn(column.id);
                    }}
                    className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded px-1 py-2 cursor-pointer"
                >
                    <TrashIcon />
                </button>
            </div>
            <div
                className={`flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto`}
            >
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        deleteTask={deleteTask}
                        updateTask={updateTask}
                        onDragStart={() => onDragStart('Task', task.id)}
                    />
                ))}
            </div>
            <button
                onClick={() => createTask(column.id)}
                className={`flex gap-2 items-center border-columnBackgroundColor border-2 rounded-md p-4 border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-blue-500 active:bg-black cursor-pointer`}
            >
                <PlusIcon />
                Add task
            </button>
        </div>
    );
}
