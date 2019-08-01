import { useRef, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface LottieDaProps {
  initial: Array<Number>;
  loading?: Array<Number>;
  inAnimations: any;
  outAnimations: any;
  children: any;
}

export type ActiveAnimation = string | null;
export type LottieViewMethods = {
  play: Function;
  reset: Function;
} | null;
export type AnimationKeyframes = Array<Number>;
export type AnimationQueue = Array<AnimationKeyframes>;

const LottieDa = ({
  initial,
  loading,
  inAnimations,
  outAnimations,
  children,
}: LottieDaProps) => {
  const animationRef = useRef<LottieViewMethods>(null);
  const [animationKeyframes, _setAnimationKeyframes] = useState({
    initial,
    loading,
    ...inAnimations,
    ...outAnimations,
  });

  const [isComplete, setIsComplete] = useState<boolean>(true);
  const [animationQueue, setAnimationQueue] = useState<AnimationQueue | []>([]);

  const [activeAnimation, setActiveAnimation] = useState<ActiveAnimation>(null);

  const onAnimationFinish = () => {
    setAnimationQueue(animationQueue.splice(1, animationQueue.length - 1));
    setIsComplete(true);
  };

  const addToQueue = (type: ActiveAnimation) => {
    if (typeof type === "string") {
      setAnimationQueue([...animationQueue, animationKeyframes[type]]);
      setActiveAnimation(type);
    }
  };

  useEffect(() => {
    setActiveAnimation("initial");
    setAnimationQueue([initial]);
  }, []);

  useEffect(() => {
    if (isComplete) {
      if (
        typeof activeAnimation === "string" &&
        ["initial", "loading"].includes(activeAnimation)
      ) {
        setActiveAnimation("loading");
        addToQueue("loading");
      }
      if (
        typeof activeAnimation === "string" &&
        Object.keys(outAnimations).includes(activeAnimation)
      ) {
        addToQueue("loading");
      }
    }
  }, [isComplete]);

  useEffect(() => {
    if (animationQueue.length > 0 && isComplete) {
      setIsComplete(false);

      // Hacky workaround for https://github.com/react-native-community/lottie-react-native/issues/505
      if (Platform.OS === "android") {
        setTimeout(() => {
          if (animationRef.current)
            animationRef.current.play(...animationQueue[0]);
        }, 10);
      } else {
        if (animationRef.current)
          animationRef.current.play(...animationQueue[0]);
      }
    }
  }, [animationQueue]);

  const showLoader = () => {
    addToQueue("loading");
    setActiveAnimation("loading");
  };

  const hideLoader = () => {
    setActiveAnimation(null);
  };

  return children({
    animationRef,
    animationQueue,
    addToQueue,
    showLoader,
    hideLoader,
    onAnimationFinish,
    isComplete,
  });
};

export default LottieDa;
