import { useState, useEffect, useContext } from 'react';
import { IconThumbUp, IconThumbDown, IconThumbUpFilled, IconThumbDownFilled } from '@tabler/icons-react';
import toast from "react-hot-toast";
import { updateFeedback } from '@/services';
import HomeContext from "@/pages/home/home.context";
import { set } from 'lodash';
import { Message } from '@/types/chat';

interface Props {
    message: Message;
  }

const FeedbackComponent = ({ message }: Props) => {
    if (message.role!="assistant") return <></>;

    const {
        state: {  selectedConversation }, handleFeedbackResponse 
      } = useContext(HomeContext);
    const [additionalFeedback, setAdditionalFeedback] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const [thumbs,setThumbs] = useState<string>("");

    const handleThumbClick = (isThumbsup: any) => {
        setThumbs(isThumbsup);
        setShowMessageBox(true);
    };

    useEffect(() => {
        if (!message.feedback){
            setThumbs("");
            return;
        }
        setThumbs(message.feedback);
    },[message])


    const handleAdditionalFeedbackChange = (event: any) => {
        setAdditionalFeedback(event.target.value);
    };
    const handleSubmitFeedback = async () => {
        if (thumbs === "positive" || thumbs === "negative") {
            // const feedbackStatus = isThumbsupHighlighted ? 'positive' : 'negative';
            const feedbackStatus = thumbs;
            const feedbackData = {
                message_id: message.id,
                feedback: feedbackStatus,
                message: additionalFeedback,
            };   
            try {
                const data = await updateFeedback(selectedConversation?.id, feedbackData);
                handleFeedbackResponse(feedbackData)
                if (thumbs === "positive") {
                    toast.success('We are glad to know that you like the response, thanks for sharing your feedback', {
                        position: "bottom-center",
                        duration: 5000
                    });
                } else if (thumbs === "negative") {
                    toast.error('Thanks for sharing the feedback, this feedback will be used to improve our responses and generate better results in the future.', {
                        position: "bottom-center",
                        duration: 5000
                    });
                }
                setShowMessageBox(false);
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
                    onClick={() => handleThumbClick("positive")}
                    className={`prose dark:prose-invert dark ${thumbs === "positive" ? 'text-blue-500' : ''}`}
                >
                    {thumbs === "positive" ? <IconThumbUpFilled /> : <IconThumbUp />}
                </button>
                <button
                    onClick={() => handleThumbClick("negative")}
                    className={`prose dark:prose-invert dark ${thumbs === "negative" ? 'text-red-500' : ''}`}
                >
                    {thumbs === "negative" ? <IconThumbDownFilled /> : <IconThumbDown />}
                </button>
            </div>
            {showMessageBox && (thumbs === "positive" || thumbs === "negative") ? (
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
