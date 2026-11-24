export const isMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobileKeywords = [
    "android",
    "iphone",
    "ipad",
    "mobile",
    "windows phone",
    "blackberry",
    "nokia",
    "opera mini",
    "samsung",
    "sony",
    "htc",
    "lg",
    "moto",
    "nexus",
    "kindle",
    "silk",
    "midp",
    "j2me",
    "wap",
    "mobile",
  ];
  const matchesMobileUA = mobileKeywords.some((keyword) =>
    userAgent.includes(keyword),
  );
  const isSmallScreen = window.innerWidth < 768;
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return matchesMobileUA || (isSmallScreen && hasCoarsePointer);
};
