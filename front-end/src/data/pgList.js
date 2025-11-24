import pg1 from "../assets/pg-1.jpg";
import pg2 from "../assets/pg-2.jpg";
import pg3 from "../assets/pg-3.jpg";
import pg4 from "../assets/pg-4.jpg";

const pgList = [
  {
    id: 1,
    name: "Velachery Comfort PG",
    location: "Velachery",
    price: 6500,
    gender: "Female",
    rating: 4.5,
    facilities: ["WiFi", "Food", "Washing Machine"],
    stayType: "Co-living",
    sharingType: "2 Sharing",
    amenities: ["WiFi", "Food", "Fridge", "Power Backup"],
    latitude: 12.9675,
    longitude: 80.2180,
    image: pg1
  },
  {
    id: 2,
    name: "Pallikaranai Nest PG",
    location: "Pallikaranai",
    price: 5000,
    gender: "Male",
    rating: 4.1,
    facilities: ["Parking", "WiFi"],
    stayType: "Student Living",
    sharingType: "3 Sharing",
    amenities: ["Parking", "WiFi", "Power Backup"],
    latitude: 12.9381,
    longitude: 80.2209,
    image: pg2
  },
  {
    id: 3,
    name: "GreenWood PG",
    location: "Sholinganallur",
    price: 7000,
    gender: "Female",
    rating: 4.7,
    facilities: ["WiFi", "Gym", "Food"],
    stayType: "Co-living",
    sharingType: "Private",
    amenities: ["WiFi", "Gym", "Food", "AC", "Fridge"],
    latitude: 12.9450,
    longitude: 80.2150,
    image: pg3
  },
  {
    id: 4,
    name: "Comfort Stay PG",
    location: "Medavakkam",
    price: 5500,
    gender: "Male",
    rating: 4.3,
    facilities: ["WiFi", "Food"],
    stayType: "Student Living",
    sharingType: "4 Sharing",
    amenities: ["WiFi", "Food", "Parking"],
    latitude: 12.9500,
    longitude: 80.2250,
    image: pg4
  }
];

export default pgList;