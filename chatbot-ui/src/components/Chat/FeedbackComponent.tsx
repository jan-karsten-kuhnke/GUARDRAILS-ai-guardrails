import { useState, useEffect, useContext } from 'react';
import { IconThumbUp, IconThumbDown, IconThumbUpFilled, IconThumbDownFilled } from '@tabler/icons-react';
import toast from "react-hot-toast";
import { updateFeedback } from '@/services';
import HomeContext from "@/pages/home/home.context";

interface Props {
    id?: string;
  }

const FeedbackComponent = ({ id }: Props) => {
    const {
        state: {  selectedConversation }, handleFeedbackResponse 
      } = useContext(HomeContext);
    const [feedback, setFeedback] = useState('');
    const [isThumbsupHighlighted, setIsThumbsupHighlighted] = useState(false);
    const [isThumbsdownHighlighted, setIsThumbsdownHighlighted] = useState(false);
    const [additionalFeedback, setAdditionalFeedback] = useState('');
    const [submitClicked, setSubmitClicked] = useState(false);

    const handleThumbClick = (isThumbsup: any) => {
        setIsThumbsupHighlighted(isThumbsup);
        setIsThumbsdownHighlighted(!isThumbsup);
        setFeedback(isThumbsup ? 'Thanks for your positive feedback!' : 'We appreciate your feedback. How can we improve?');
        setSubmitClicked(false); 
    };

    const handleAdditionalFeedbackChange = (event: any) => {
        setAdditionalFeedback(event.target.value);
    };
    const handleSubmitFeedback = async () => {
        if (isThumbsupHighlighted || isThumbsdownHighlighted) {
            const feedbackStatus = isThumbsupHighlighted ? 'positive' : 'negative';
            const feedbackData = {
                message_id: id,
                feedback: feedbackStatus,
                message: additionalFeedback,
            };   
            try {
                const data = await updateFeedback(selectedConversation?.id, feedbackData);
                handleFeedbackResponse(feedbackData)
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
                setSubmitClicked(true);
                setAdditionalFeedback('');
            } catch (error) {
                console.error("Error submitting feedback:", error);
            }
        }
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
            {!submitClicked && (isThumbsupHighlighted || isThumbsdownHighlighted) ? (
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
