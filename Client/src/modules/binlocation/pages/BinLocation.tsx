import { useParams } from "react-router-dom";

export default function BinLocation() {
  const { id } = useParams();
  return <div>{id}</div>;
}
