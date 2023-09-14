import { useState, useEffect, useContext } from 'react';
import { IconThumbUp, IconThumbDown, IconThumbUpFilled, IconThumbDownFilled } from '@tabler/icons-react';
import toast from "react-hot-toast";
import { updateFeedback } from '@/services';
import HomeContext from "@/pages/home/home.context";
import { Message } from '@/types/chat';

interface Props {
    message: Message;
  }

const FeedbackComponent = ({ message }: Props) => {
    if (message.role!="assistant") return <></>;
    const {
        state: {  selectedConversation, theme },
        handleUpdateSelectedConversation
    } = useContext(HomeContext);
    const [additionalFeedback, setAdditionalFeedback] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const [thumbs,setThumbs] = useState<string>("");

    const callFeedbackApi = (feedbackData: any) => {
        
        try {
            const updatedMessages = selectedConversation?.messages.map((m) => {
                if (m.id === feedbackData.message_id) {
                  return {
                    ...m,
                    user_feedback:{ type: feedbackData.user_feedback.type, message: feedbackData.user_feedback.message },
                  };
                }
                return m;
              });
            handleUpdateSelectedConversation({key:"messages",value:updatedMessages})
        } catch (error) {
            console.error("Error submitting feedback:", error);
        }
    }

    const handleThumbClick = async(isThumbsup: any) => {

        setThumbs(isThumbsup);
        setShowMessageBox(true);
        
        if(message.user_feedback?.type != isThumbsup) {
            const feedbackStatus = isThumbsup;
            const feedbackData = {
                message_id: message.id,
                user_feedback: {type:feedbackStatus},
            };
            callFeedbackApi(feedbackData);
            const data = await updateFeedback(selectedConversation?.id, feedbackData);
        }
    };

    useEffect(() => {
        if (!message.user_feedback?.type){
            setThumbs("");
            return;
        }
        setThumbs(message.user_feedback.type);
    },[message])
    
    const handleSubmitFeedback = async() => {
        if (thumbs === "positive" || thumbs === "negative") {
            try {
                const feedbackStatus = thumbs;
                const feedbackData = {
                    message_id: message.id,
                    user_feedback: {type:feedbackStatus, message:additionalFeedback},
                };
                callFeedbackApi(feedbackData);
                const data = await updateFeedback(selectedConversation?.id, feedbackData);

                if (thumbs === "positive") {
                    toast.success('We are glad to know that you like the response, thanks for sharing your feedback', {
                        position: "bottom-center",
                        duration: 5000
                    });
                } else if (thumbs === "negative") {
                    toast.success('Thanks for sharing the feedback, this feedback will be used to improve our responses and generate better results in the future.', {
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
                        onChange={(event => setAdditionalFeedback(event.target.value))}
                        className="border border-gray-300 rounded-md p-2 pr-5 pl-5 pt-4 resize-none focus:outline-none"
                    />
                    <button onClick={handleSubmitFeedback} className={` rounded-md p-2 ${theme.primaryButtonTheme}`}>
                        Submit Feedback
                    </button>
                </>
            ) : null}
        </div>
    );
};

export default FeedbackComponent;
