import { forwardRef } from "react";
type ContactProps = {
  refs: {
    contactRef: React.RefObject<HTMLDivElement>;
  }
}
const Contact = forwardRef ((props, ref) => {  
  
    return (
      <div className="h-screen bg-red-400" ref={ref}>
          <h1>Contact</h1>
      </div>
    );
  });
  
  export default Contact;