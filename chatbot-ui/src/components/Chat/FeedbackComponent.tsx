import { useState, useEffect } from 'react';
import { IconThumbUp, IconThumbDown, IconThumbUpFilled, IconThumbDownFilled } from '@tabler/icons-react';
import toast from "react-hot-toast";

const FeedbackComponent = () => {
    const [feedback, setFeedback] = useState('');
    const [isThumbsupHighlighted, setIsThumbsupHighlighted] = useState(false);
    const [isThumbsdownHighlighted, setIsThumbsdownHighlighted] = useState(false);
    const [additionalFeedback, setAdditionalFeedback] = useState('');

    const handleThumbClick = (isThumbsup: any) => {
        setIsThumbsupHighlighted(isThumbsup);
        setIsThumbsdownHighlighted(!isThumbsup);
        setFeedback(isThumbsup ? 'Thanks for your positive feedback!' : 'We appreciate your feedback. How can we improve?');
    };

    const handleAdditionalFeedbackChange = (event: any) => {
        setAdditionalFeedback(event.target.value);
    };

    const handleSubmitFeedback = () => {
        if (isThumbsupHighlighted) {
            toast.success('We are glad to know that you like the response, thanks for sharing your feedback', {
                position: "bottom-center",
                duration: 5000
            });
        } else if (isThumbsdownHighlighted) {
            toast.error('Thanks for sharing the feedback, this feedback will be used to improve our responses and generate better results in the future.', {
                position: "bottom-center",
                duration: 5000
            });
        }
        setIsThumbsupHighlighted(false);
        setIsThumbsdownHighlighted(false);
        setAdditionalFeedback('');
    };

    return (
        <div className="flex flex-col gap-3 pt-4">
            <div className="flex gap-3">
                <button
                    onClick={() => handleThumbClick(true)}
                    className={`prose dark:prose-invert dark ${isThumbsupHighlighted ? 'text-blue-500' : ''}`}
                >
                    {isThumbsupHighlighted ? <IconThumbUpFilled /> : <IconThumbUp />}
                </button>
                <button
                    onClick={() => handleThumbClick(false)}
                    className={`prose dark:prose-invert dark ${isThumbsdownHighlighted ? 'text-red-500' : ''}`}
                >
                    {isThumbsdownHighlighted ? <IconThumbDownFilled /> : <IconThumbDown />}
                </button>
            </div>
            <p className={`prose dark:prose-invert dark ${isThumbsupHighlighted || isThumbsdownHighlighted ? '' : 'hidden'}`}>
                {feedback}
            </p>
            {isThumbsupHighlighted || isThumbsdownHighlighted ? (
                <>
                    <textarea
                        placeholder="Add additional feedback (optional)"
                        value={additionalFeedback}
                        onChange={handleAdditionalFeedbackChange}
                        className="border border-gray-300 rounded-md p-2 resize-none"
                    />
                    <button onClick={handleSubmitFeedback} className="bg-blue-500 text-white rounded-md p-2 hover:bg-blue-600">
                        Submit Feedback
                    </button>
                </>
            ) : null}
        </div>
    );
};

export default FeedbackComponent;


