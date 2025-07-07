import { useState } from 'react';
import type { Id, Task } from '@/types';
import { TrashIcon } from '@/icons/TrashIcon';

const PLACEHOLDER = 'Task content here';

interface TaskCardProps {
    task: Task;
    deleteTask: (id: Id) => void;
    updateTask: (id: Id, content: string) => void;
    onDragStart: () => void;
    onDrop: () => void; // Add onDrop prop
}

export function TaskCard({
    task,
    deleteTask,
    updateTask,
    onDragStart,
    onDrop,
}: TaskCardProps) {
    const [mouseIsOver, setMouseIsOver] = useState(false);
    const [editMode, setEditMode] = useState(false);

    const toggleEditMode = () => {
        setEditMode((prev) => !prev);
        setMouseIsOver(false);
    };

    const isTaskEmpty = !task.content.trim();

    return (
        <div
            draggable
            onDragStart={onDragStart}
            onDrop={onDrop} // Handle drop on the task card
            onClick={toggleEditMode}
            onMouseEnter={() => !editMode && setMouseIsOver(true)}
            onMouseLeave={() => !editMode && setMouseIsOver(false)}
            className={`bg-mainBackgroundColor p-2.5 h-[100px] min-h-[100px] items-center flex text-left rounded-xl hover:ring-2 hover:ring-inset hover:ring-blue-500 cursor-grab relative`}
        >
            {editMode ? (
                <textarea
                    value={task.content}
                    autoFocus
                    placeholder={PLACEHOLDER}
                    onBlur={toggleEditMode}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.shiftKey) toggleEditMode();
                    }}
                    onChange={(e) => updateTask(task.id, e.target.value)}
                    className="h-[90%] w-full resize-none border-none rounded bg-transparent text-white focus:outline-none"
                ></textarea>
            ) : (
                <>
                    <p className="my-auto h-[90%] w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap">
                        {isTaskEmpty ? (
                            <span className="opacity-50">{PLACEHOLDER}</span>
                        ) : (
                            <span>{task.content}</span>
                        )}
                    </p>
                    {mouseIsOver && (
                        <button
                            onClick={() => deleteTask(task.id)}
                            className="stroke-white absolute right-4 top-1/2 -translate-y-1/2 bg-columnBackgroundColor p-2 rounded cursor-pointer"
                        >
                            <TrashIcon />
                        </button>
                    )}
                </>
            )}
        </div>
    );
}
